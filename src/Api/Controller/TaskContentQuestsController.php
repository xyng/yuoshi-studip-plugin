<?php
namespace Xyng\Yuoshi\Api\Controller;


use DBManager;
use JsonApi\Errors\InternalServerError;
use JsonApi\Errors\RecordNotFoundException;
use JsonApi\JsonApiController;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Valitron\Validator;
use Xyng\Yuoshi\Authority\TaskContentAuthority;
use Xyng\Yuoshi\Authority\TaskContentQuestAuthority;
use Xyng\Yuoshi\Api\Helper\JsonApiDataHelper;
use Xyng\Yuoshi\Api\Helper\ValidationTrait;
use Xyng\Yuoshi\Helper\PermissionHelper;
use Xyng\Yuoshi\Model\TaskContentQuests;

class TaskContentQuestsController extends JsonApiController
{
    use ValidationTrait;
    protected $allowedPagingParameters = ['offset', 'limit'];

    public function index(ServerRequestInterface $request, ResponseInterface $response, $args) {
        $quest_id = $args['id'] ?? [];

        $quest_ids = $quest_id ? [$quest_id] : [];

        if (!$quest_ids) {
            $filters = $this->getQueryParameters()->getFilteringParameters();
            $quest_ids = explode(',', $filters['task'] ?? '');
        }

        $tasks = TaskContentQuestAuthority::findFiltered($quest_ids, $this->getUser($request));

        list($offset, $limit) = $this->getOffsetAndLimit();

        return $this->getPaginatedContentResponse(
            array_slice($tasks, $offset, $limit),
            count($tasks)
        );
    }

    public function show(ServerRequestInterface $request, ResponseInterface $response, $args) {
        $content_id = $args['content_id'] ?? null;
        $quest_id = $args['quest_id'] ?? null;

        if (!$quest_id) {
            throw new RecordNotFoundException();
        }

        $quest = TaskContentQuestAuthority::findOneFiltered($quest_id, $this->getUser($request), [], [
            'yuoshi_task_content_quests.content_id' => $content_id
        ]);

        if (!$quest) {
            throw new RecordNotFoundException();
        }

        return $this->getContentResponse($quest);
    }

    public function create(ServerRequestInterface $request, ResponseInterface $response) {
        $validated = $this->validate($request, true);
        $data = new JsonApiDataHelper($validated);

        $content_id = $data->getRelationId('content');

        if (!$content_id) {
            throw new RecordNotFoundException();
        }

        $content = TaskContentAuthority::findOneFiltered($content_id, $this->getUser($request), PermissionHelper::getMasters('dozent'));

        if (!$content) {
            throw new RecordNotFoundException();
        }

        $quest = TaskContentQuests::build(
            $data->getAttributes([
                'prePhrase',
                'multiple',
                'require_order',
                'custom_answer',
                'sort',
            ])
        );

        $quest->content_id = $content->id;

        if (!$quest->store()) {
            throw new InternalServerError("could not persist entity");
        }

        return $this->getContentResponse($quest, 201);
    }

    public function update(ServerRequestInterface $request, ResponseInterface $response, $args) {
        $quest_id = $args['quest_id'] ?? null;

        $validated = $this->validate($request, false);
        $data = new JsonApiDataHelper($validated);

        $quest = TaskContentQuestAuthority::findOneFiltered($quest_id, $this->getUser($request), PermissionHelper::getMasters('dozent'));

        if (!$quest) {
            throw new RecordNotFoundException();
        }

        $attributes = $data->getAttributes([
            'name',
            'prePhrase',
            'question',
            'multiple',
            'require_order',
            'custom_answer',
            'sort',
        ]);

        foreach ($attributes as $key => $value) {
            $quest->{$key} = $value;
        }

        if (!$quest->store()) {
            throw new InternalServerError("could not persist entity");
        }

        return $this->getContentResponse($quest);
    }

    public function delete(ServerRequestInterface $request, ResponseInterface $response, $args) {
        $quest_id = $args['quest_id'] ?? null;

        if (!$quest_id) {
            throw new RecordNotFoundException();
        }

        $quest = TaskContentQuestAuthority::findOneFiltered($quest_id, $this->getUser($request), PermissionHelper::getMasters('dozent'));

        if (!$quest->delete()) {
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
            $validator = $validator
                ->rule('required', 'data.relationships.content.data.id');
        }

        return $validator
            ->rule('required', 'data.attributes.multiple')
            ->rule('boolean', 'data.attributes.multiple')
            ->rule('required', 'data.attributes.require_order')
            ->rule('boolean', 'data.attributes.require_order')
            ->rule('numeric', 'data.attributes.sort')
        ;
    }
}
