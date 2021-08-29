<?php
namespace Xyng\Yuoshi\Model;

use Course;
use \User;
use Xyng\Yuoshi\Authority\StationAuthority;
use Xyng\Yuoshi\Helper\PermissionHelper;
use Xyng\Yuoshi\Helper\QueryField;

/**
 * Class Stations
 * @package Xyng\Yuoshi\Model
 *
 * @property string $package_id
 * @property string $title
 * @property string $slug
 * @property int $sort
 * @property Packages $package
 * @property Tasks[] $tasks
 *
 * @method static Stations find(string $id)
 */
class Stations extends BaseModel
{
    protected static function configure($config = [])
    {
        $config['db_table'] = 'yuoshi_stations';

        $config['has_many']['tasks'] = [
            'class_name' => Tasks::class,
            'assoc_func' => 'findByStation_id',
            'assoc_foreign_key' => 'station_id',
            'on_delete' => true,
            'on_store' => true,
        ];

        $config['belongs_to']['package'] = [
            'class_name' => Packages::class,
            'foreign_key' => 'package_id'
        ];

        parent::configure($config);
    }

    public static function nextSort(string $package_id)
    {
        $db_table = static::config('db_table');
        $maxSortStmt = \DBManager::get()->prepare("SELECT max(`sort`) as max_sort FROM `$db_table` WHERE `package_id` = :packageId GROUP BY `package_id`");
        $maxSortStmt->execute([
            'packageId' => $package_id,
        ]);

        $maxSort = $maxSortStmt->fetch();
        if ($maxSort === false) {
            return 0;
        }

        return ((int) $maxSort['max_sort']) + 1;
    }

    /**
     * @param User $user
     * @param bool $byUsers
     * @return UserStationProgress|null|UserStationProgress[]
     */
    public function getProgress(User $user, bool $byUsers = false)
    {
        $solvedTaskCount = 'count(distinct concat(`yuoshi_user_task_solutions`.`task_id`, `yuoshi_user_task_solutions`.`user_id`))';

        $studentJoinConditions = [];

        $isDozent = PermissionHelper::getPerm()->have_studip_perm('dozent', $this->package->course_id, $user->id);
        if (!$isDozent) {
            $studentJoinConditions['Students.user_id'] = $user->id;
        }

        $query = [
            'joins' => [
                [
                    'sql' => StationAuthority::getFilter(),
                    'params' => [
                        'user_id' => $user->id,
                    ]
                ],
                [
                    // we have two joins on the tasks table.
                    // this join is not used by the other joins so we can get
                    // the total task count
                    'type' => 'left',
                    'table' => 'yuoshi_tasks',
                    'alias' => 'TotalTasks',
                    'on' => [
                        'yuoshi_stations.id' => new QueryField('TotalTasks.station_id')
                    ]
                ],
                [
                    // this one is just an intermediate join so we can get the solutions
                    'type' => 'left',
                    'table' => 'yuoshi_tasks',
                    'on' => [
                        'yuoshi_stations.id' => new QueryField('yuoshi_tasks.station_id')
                    ]
                ],
                [
                    'type' => 'left',
                    'table' => 'yuoshi_user_task_solutions',
                    'on' => [
                        'yuoshi_tasks.id' => new QueryField('yuoshi_user_task_solutions.task_id'),
                        'yuoshi_user_task_solutions.finished is not null',
                    ]
                ],
                [
                    'type' => 'left',
                    'table' => 'seminar_user',
                    'alias' => 'Students',
                    'on' => [
                        'Students.Seminar_id' => new QueryField('yuoshi_packages.course_id'),
                        'Students.status IN' => PermissionHelper::getSlaves('tutor'),
                        'Students.user_id' => new QueryField('yuoshi_user_task_solutions.user_id'),
                    ] + $studentJoinConditions,
                ],
            ],
            'conditions' => [
                'yuoshi_stations.id' => $this->id,
            ] + ($byUsers ? [
                'Students.user_id is not null'
            ] : []),
            'group' => $byUsers ? [
                'yuoshi_stations.id',
                'yuoshi_user_task_solutions.user_id',
            ] : [
                'yuoshi_stations.id'
            ]
        ];

        $progressCount = '(' . $solvedTaskCount . '* 100) / (count(distinct `TotalTasks`.`id`) * count(distinct `yuoshi_user_task_solutions`.`user_id`))';

        if (!$byUsers) {
            /** @var UserStationProgress|null $result */
            $result = UserStationProgress::findOneWithQuery(
                $query,
                [
                    'progress' => $progressCount,
                ]
            );

            return $result;
        }

        /** @var UserStationProgress[] $result */
        $result = UserStationProgress::findWithQuery(
            $query,
            [
                'progress' => $progressCount,
                'user_id' => 'yuoshi_user_task_solutions.user_id'
            ]
        );

        return $result;
    }
}
