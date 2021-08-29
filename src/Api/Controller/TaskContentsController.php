<?php
namespace Xyng\Yuoshi\Api\Controller;


use JsonApi\Errors\AuthorizationFailedException;
use JsonApi\Errors\InternalServerError;
use JsonApi\Errors\RecordNotFoundException;
use JsonApi\JsonApiController;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Valitron\Validator;
use Xyng\Yuoshi\Authority\PackageAuthority;
use Xyng\Yuoshi\Authority\TaskAuthority;
use Xyng\Yuoshi\Authority\TaskContentAuthority;
use Xyng\Yuoshi\Api\Helper\JsonApiDataHelper;
use Xyng\Yuoshi\Api\Helper\ValidationTrait;
use Xyng\Yuoshi\Helper\DBHelper;
use Xyng\Yuoshi\Helper\PermissionHelper;
use Xyng\Yuoshi\Model\TaskContents;
use Xyng\Yuoshi\Model\Tasks;

class TaskContentsController extends JsonApiController
{
    use ValidationTrait;

    protected $allowedPagingParameters = ['offset', 'limit'];

    protected $allowedIncludePaths = [
        'quests',
        'quests.answers',
        'images',
    ];

    protected $allowedFilteringParameters = [
        'task'
    ];

    public function index(ServerRequestInterface $request, ResponseInterface $response, $args) {
        ['id' => $task_id] = $args;

        $task_ids = $task_id ? [$task_id] : [];

        if (!$task_ids) {
            $filters = $this->getQueryParameters()->getFilteringParameters();
            $task_ids = explode(',', $filters['task'] ?? '');
        }

        $tasks = TaskContents::findWithQuery([
            'joins' => [
                [
                    'sql' => TaskContentAuthority::filterByUsersTasks(),
                    'params' => [
                        'user_id' => $this->getUser($request)->id
                    ]
                ]
            ],
            'conditions' => [
                'yuoshi_tasks.id IN' => $task_ids,
            ]
        ]);

        list($offset, $limit) = $this->getOffsetAndLimit();

        return $this->getPaginatedContentResponse(
            array_slice($tasks, $offset, $limit),
            count($tasks)
        );
    }

    public function show(ServerRequestInterface $request, ResponseInterface $response, $args) {
        $task_id = $args['task_id'] ?? null;
        $content_id = $args['content_id'] ?? null;

        if (!$content_id) {
            throw new RecordNotFoundException();
        }

        $quest = TaskContentAuthority::findOneFiltered($content_id, $this->getUser($request), [], [
            'yuoshi_task_contents.task_id' => $task_id
        ]);

        if (!$quest) {
            throw new RecordNotFoundException();
        }

        return $this->getContentResponse($quest);
    }

    public function create(ServerRequestInterface $request, ResponseInterface $response) {
        $validated = $this->validate($request, true);
        $data = new JsonApiDataHelper($validated);

        $task_id = $data->getRelationId('task');

        if (!$task_id) {
            throw new RecordNotFoundException();
        }

        $task = TaskAuthority::findOneFiltered($task_id, $this->getUser($request), PermissionHelper::getMasters('dozent'));

        if (!$task) {
            throw new RecordNotFoundException();
        }

        $content = TaskContents::build(
            $data->getAttributes([
                'title',
                'content',
                'intro',
                'outro',
                'file',
            ])
        );

        $content->task_id = $task->id;

        if (!$content->store()) {
            throw new InternalServerError("could not persist entity");
        }

        return $this->getContentResponse($content, 201);
    }

    public function update(ServerRequestInterface $request, ResponseInterface $response, $args) {
        $content_id = $args['content_id'] ?? null;

        $validated = $this->validate($request, false);
        $data = new JsonApiDataHelper($validated);

        $content = TaskContentAuthority::findOneFiltered($content_id, $this->getUser($request), PermissionHelper::getMasters('dozent'));

        if (!$content) {
            throw new RecordNotFoundException();
        }

        $attributes = $data->getAttributes([
            'title',
            'content',
            'intro',
            'outro',
            'file',
        ]);
        foreach ($attributes as $key => $value) {
            $content->{$key} = $value;
        }

        if ($content->isDirty() && !$content->store()) {
            throw new InternalServerError("could not persist entity");
        }

        return $this->getContentResponse($content);
    }

    public function delete(ServerRequestInterface $request, ResponseInterface $response, $args) {
        $content_id = $args['content_id'] ?? null;

        if (!$content_id) {
            throw new RecordNotFoundException();
        }

        $content = TaskContentAuthority::findOneFiltered($content_id, $this->getUser($request), PermissionHelper::getMasters('dozent'));

        if (!$content->delete()) {
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
            $validator = $validator->rule('required', 'data.relationships.task.data.id');
        }

        return $validator
            ->rule('required', 'data.attributes.title')
            ->rule('required', 'data.attributes.content')
        ;
    }
}
