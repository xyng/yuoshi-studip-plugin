<?php
namespace Xyng\Yuoshi\Model;

use Course;
use \User;
use SimpleORMap;
use Xyng\Yuoshi\Authority\PackageAuthority;
use Xyng\Yuoshi\Helper\PermissionHelper;
use Xyng\Yuoshi\Helper\QueryField;

/**
 * Class Packages
 * @package Xyng\Yuoshi\Model
 *
 * @property string $course_id
 * @property string $title
 * @property string $slug
 * @property int $sort
 * @property Course $course
 * @property Tasks[] $tasks
 *
 * @method static Packages find(string $id)
 */
class Packages extends BaseModel
{
    protected static function configure($config = [])
    {
        $config['db_table'] = 'yuoshi_packages';

        $config['has_many']['stations'] = [
            'class_name' => Stations::class,
            'assoc_func' => 'findByPackage_id',
            'assoc_foreign_key' => 'package_id',
            'on_delete' => true,
            'on_store' => true,
        ];

        $config['belongs_to']['course'] = [
            'class_name' => Course::class,
            'foreign_key' => 'course_id'
        ];

        parent::configure($config);
    }

    // TODO: check in db if this package is playable by user.
    public $playable = true;

    public static function nextSort(string $course_id) {
        $db_table = static::config('db_table');
        $maxSortStmt = \DBManager::get()->prepare("SELECT max(`sort`) as max_sort FROM `$db_table` WHERE `course_id` = :courseId GROUP BY `coursE_id`");
        $maxSortStmt->execute([
            'courseId' => $course_id,
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
     * @return UserPackageProgress|null|UserPackageProgress[]
     */
    public function getProgress(User $user, bool $byUsers = false) {
        $solvedTaskCount = 'count(distinct concat(`yuoshi_user_task_solutions`.`task_id`, `yuoshi_user_task_solutions`.`user_id`))';

        $studentJoinConditions = [];

        $isDozent = PermissionHelper::getPerm()->have_studip_perm('dozent', $this->course_id, $user->id);
        if (!$isDozent) {
            $studentJoinConditions['Students.user_id'] = $user->id;
        }

        $query = [
            'joins' => [
                [
                    'sql' => PackageAuthority::getFilter(),
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
                        'yuoshi_packages.id' => new QueryField('TotalTasks.package_id')
                    ]
                ],
                [
                    // this one is just an intermediate join so we can get the solutions
                    'type' => 'left',
                    'table' => 'yuoshi_tasks',
                    'on' => [
                        'yuoshi_packages.id' => new QueryField('yuoshi_tasks.package_id')
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
                'yuoshi_packages.id' => $this->id,
            ] + ($byUsers ? [
                'Students.user_id is not null'
            ] : []),
            'group' => $byUsers ? [
                'yuoshi_packages.id',
                'yuoshi_user_task_solutions.user_id',
            ] : [
                'yuoshi_packages.id'
            ]
        ];

        $progressCount = '(' . $solvedTaskCount . '* 100) / (count(distinct `TotalTasks`.`id`) * count(distinct `yuoshi_user_task_solutions`.`user_id`))';

        if (!$byUsers) {
            return UserPackageProgress::findOneWithQuery(
                $query,
                [
                    'progress' => $progressCount,
                ]
            );
        }

        return UserPackageProgress::findWithQuery(
            $query,
            [
                'progress' => $progressCount,
                'user_id' => 'yuoshi_user_task_solutions.user_id'
            ]
        );
    }
}
