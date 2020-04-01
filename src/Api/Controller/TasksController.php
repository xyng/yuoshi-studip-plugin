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
use Valitron\Validator;
use Xyng\Yuoshi\Api\Authority\PackageAuthority;
use Xyng\Yuoshi\Api\Authority\TaskAuthority;
use Xyng\Yuoshi\Api\Exception\ValidationException;
use Xyng\Yuoshi\Api\Helper\JsonApiDataHelper;
use Xyng\Yuoshi\Api\Helper\ValidationTrait;
use Xyng\Yuoshi\Helper\PermissionHelper;
use Xyng\Yuoshi\Model\Packages;
use Xyng\Yuoshi\Model\Tasks;

class TasksController extends JsonApiController
{
    use ValidationTrait;

    protected $allowedPagingParameters = ['offset', 'limit'];
    protected $allowedFilteringParameters = ['sort', 'package'];
    protected $allowedIncludePaths = [
        'contents',
        'contents.quests',
        'contents.quests.answers'
    ];

    public function index(ServerRequestInterface $request, ResponseInterface $response, $args) {
        $package_id = $args['id'] ?? null;
        $package_ids = $package_id ? [$package_id] : [];

        $filters = $this->getQueryParameters()->getFilteringParameters();
        if (!$package_ids) {
            $package_ids = explode(',', $filters['package'] ?? '');
        }
        $sort = $filters['sort'] ?? null;

        $where = [];
        if ($sort) {
            $where['sort'] = $sort;
        }

        if (!$package_ids) {
            throw new \InvalidArgumentException("Cannot select Tasks without package filter.");
        }

        $tasks = TaskAuthority::findFiltered($package_ids, $this->getUser($request), [], $where);

        list($offset, $limit) = $this->getOffsetAndLimit();

        return $this->getPaginatedContentResponse(
            array_slice($tasks, $offset, $limit),
            count($tasks)
        );
    }

    public function nextTask(ServerRequestInterface $request, ResponseInterface $response, $args) {
        $sql = <<<'EOD'
            LEFT JOIN yuoshi_user_task_solutions Solutions ON (
                Solutions.task_id = yuoshi_tasks.id AND
                Solutions.user_id = :user_id
            )
            WHERE (
                Solutions.id IS NULL
                AND `yuoshi_tasks`.`package_id` = :package_id
            )
            ORDER BY `yuoshi_tasks`.`sort` ASC
EOD;

        ['id' => $package_id] = $args;
        $task = Tasks::findOneBySQL(trim($sql), [
            'user_id' => $this->getUser($request)->id,
            'package_id' => $package_id,
        ]);

        return $this->getContentResponse($task);
    }

    public function show(ServerRequestInterface $request, ResponseInterface $response, $args) {
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

    public function create(ServerRequestInterface $request, ResponseInterface $response, $args) {
        $validated = $this->validate($request, true);
        $data = new JsonApiDataHelper($validated);

        $package_id = $data->getRelation('package')['data']['id'] ?? null;

        if (!$package_id) {
            throw new RecordNotFoundException();
        }

        /** @var Packages|null $package */
        $package = PackageAuthority::findOneFiltered($package_id, $this->getUser($request), PermissionHelper::getMasters('dozent'));

        if ($package == null) {
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
                'package_id' => $package_id,
            ]
        );

        if (!$task->store()) {
            throw new InternalServerError("could not persist entity");
        }

        return $this->getContentResponse($task);
    }

    public function update(ServerRequestInterface $request, ResponseInterface $response, $args) {
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
            throw new InternalServerError("could not update package");
        }

        return $this->getContentResponse($task);
    }

    public function delete(ServerRequestInterface $request, ResponseInterface $response, $args) {
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
                ->rule('required', 'data.relationships.package.data.id')
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
