<?php
namespace Xyng\Yuoshi\Api\Controller;

use Course;
use JsonApi\Errors\AuthorizationFailedException;
use JsonApi\Errors\InternalServerError;
use JsonApi\Errors\RecordNotFoundException;
use JsonApi\Errors\UnprocessableEntityException;
use JsonApi\JsonApiController;
use JsonApi\Routes\Courses\Authority as CourseAuthority;
use Psr\Http\Message\RequestInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use User;
use Valitron\Validator;
use Xyng\Yuoshi\Authority\PackageAuthority;
use Xyng\Yuoshi\Authority\StationAuthority;
use Xyng\Yuoshi\Authority\TaskAuthority;
use Xyng\Yuoshi\Authority\TaskSolutionAuthority;
use Xyng\Yuoshi\Api\Exception\ValidationException;
use Xyng\Yuoshi\Api\Helper\JsonApiDataHelper;
use Xyng\Yuoshi\Api\Helper\ValidationTrait;
use Xyng\Yuoshi\Helper\AuthorityHelper;
use Xyng\Yuoshi\Helper\DBHelper;
use Xyng\Yuoshi\Helper\PermissionHelper;
use Xyng\Yuoshi\Helper\QueryField;
use Xyng\Yuoshi\Model\Packages;
use Xyng\Yuoshi\Model\Station;
use Xyng\Yuoshi\Model\Tasks;
use Xyng\Yuoshi\Model\UserTaskSolutions;

class TasksController extends JsonApiController
{
    use ValidationTrait;

    protected $allowedPagingParameters = ['offset', 'limit'];
    protected $allowedFilteringParameters = ['sort', 'station'];
    protected $allowedIncludePaths = [
        'contents',
        'contents.quests',
        'contents.quests.answers'
    ];

    public function index(ServerRequestInterface $request, ResponseInterface $response, $args)
    {
        $station_id = $args['id'] ?? null;
        $station_ids = $station_id ? [$station_id] : [];

        $filters = $this->getQueryParameters()->getFilteringParameters();
        if (!$station_ids) {
            $station_ids = explode(',', $filters['station'] ?? '');
        }
        $sort = $filters['sort'] ?? null;

        $where = [];
        if ($sort) {
            $where['sort'] = $sort;
        }

        if (!$station_ids) {
            throw new \InvalidArgumentException("Cannot select Station without station filter.");
        }

        $tasks = TaskAuthority::findFiltered($station_ids, $this->getUser($request), [], $where);

        list($offset, $limit) = $this->getOffsetAndLimit();

        return $this->getPaginatedContentResponse(
            array_slice($tasks, $offset, $limit),
            count($tasks)
        );
    }

    public function nextTask(ServerRequestInterface $request, ResponseInterface $response, $args)
    {
        /** @var User $user */
        $user = $this->getUser($request);

        ['id' => $station_id] = $args;

        /** @var Tasks|null $task */
        $task = Tasks::findOneWithQuery([
            'joins' => [
                [
                    'type' => 'left',
                    'table' => 'yuoshi_user_task_solutions',
                    'alias' => 'Solutions',
                    'on' => [
                        'Solutions.task_id' => new QueryField('yuoshi_tasks.id'),
                        'Solutions.user_id' => $user->id,
                        'Solutions.finished IS NOT NULL'
                    ],
                ]
            ],
            'conditions' => [
                'Solutions.id IS NULL',
                'yuoshi_tasks.station_id' => $station_id,
            ],
            'order' => [
                '`yuoshi_tasks`.`sort` ASC'
            ]
        ]);

        if ($task) {
            // check if there is a solution for this task
            $solution = TaskSolutionAuthority::findFiltered([$task->id], $user, [], [
                'yuoshi_user_task_solutions.finished is null',
                'yuoshi_user_task_solutions.user_id' => $user->id,
            ]);
            if (!$solution) {
                // create new task solution so we can track answer time
                $solution = UserTaskSolutions::build([
                    'task_id' => $task->id,
                    'user_id' => $user->id,
                ]);

                if (!$solution->store()) {
                    throw new InternalServerError('could not persist entity');
                }
            }
        }

        return $this->getContentResponse($task);
    }

    public function show(ServerRequestInterface $request, ResponseInterface $response, $args)
    {
        $task_id = $args['id'] ?? null;

        if (!$task_id) {
            throw new RecordNotFoundException();
        }

        $task = TaskAuthority::findOneFiltered($task_id, $this->getUser($request));

        if (!$task) {
            throw new RecordNotFoundException();
        }

        return $this->getContentResponse($task);
    }

    public function create(ServerRequestInterface $request, ResponseInterface $response, $args)
    {
        $validated = $this->validate($request, true);
        $data = new JsonApiDataHelper($validated);

        $station_id = $data->getRelation('station')['data']['id'] ?? null;

        if (!$station_id) {
            throw new RecordNotFoundException();
        }

        /** @var Station|null $station */
        $station = StationAuthority::findOneFiltered($station_id, $this->getUser($request), PermissionHelper::getMasters('dozent'));

        if ($station == null) {
            throw new RecordNotFoundException();
        }

        $task = Tasks::build(
            $data->getAttributes([
                'title',
                'kind',
                'description',
                'credits',
            ])
            +
            [
                'sort' => 0,
                'is_training' => $data->getAttribute('kind') == 'training',
                'station_id' => $station_id,
            ]
        );

        if (!$task->store()) {
            throw new InternalServerError("could not persist entity");
        }

        return $this->getContentResponse($task);
    }

    public function update(ServerRequestInterface $request, ResponseInterface $response, $args)
    {
        $task_id = $args['id'] ?? null;

        if ($task_id === null) {
            throw new RecordNotFoundException();
        }

        $task = TaskAuthority::findOneFiltered($task_id, $this->getUser($request), PermissionHelper::getMasters('dozent'));

        if (!$task) {
            throw new RecordNotFoundException();
        }

        $validated = $this->validate($request);

        $data = new JsonApiDataHelper($validated);
        $attrs = $data->getAttributes(['title', 'kind', 'description', 'sort', 'is_training', 'credits']);

        foreach ($attrs as $key => $value) {
            $task->{$key} = $value ?? $task->{$key};
        }

        // TODO: handle image

        if ($task->isDirty() && !$task->store()) {
            throw new InternalServerError("could not update station");
        }

        return $this->getContentResponse($task);
    }

    public function delete(ServerRequestInterface $request, ResponseInterface $response, $args)
    {
        $task_id = $args['task_id'] ?? null;

        if (!$task_id) {
            throw new RecordNotFoundException();
        }

        $task = TaskAuthority::findOneFiltered($task_id, $this->getUser($request), PermissionHelper::getMasters('dozent'));

        if (!$task->delete()) {
            throw new InternalServerError("could not delete entity");
        }

        return $response->withStatus(204);
    }

    /**
     * @inheritDoc
     */
    protected function buildResourceValidationRules(Validator $validator, $new = false): Validator
    {
        if ($new) {
            $validator
                ->rule('required', 'data.relationships.station.data.id')
                ->rule('required', 'data.attributes.title')
                ->rule('required', 'data.attributes.kind')
                ->rule('required', 'data.attributes.credits');
        }

        $validator
            ->rule('integer', 'data.attributes.sort')
            ->rule('integer', 'data.attributes.credits')
            ->rule('boolean', 'data.attributes.is_training')
            ->rule('in', 'data.attributes.kind', Tasks::$types);

        return $validator;
    }
}
