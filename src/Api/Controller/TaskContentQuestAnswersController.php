<?php
namespace Xyng\Yuoshi\Api\Controller;


use JsonApi\Errors\InternalServerError;
use JsonApi\Errors\RecordNotFoundException;
use JsonApi\JsonApiController;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Valitron\Validator;
use Xyng\Yuoshi\Api\Authority\TaskContentQuestAnswerAuthority;
use Xyng\Yuoshi\Api\Authority\TaskContentQuestAuthority;
use Xyng\Yuoshi\Api\Helper\JsonApiDataHelper;
use Xyng\Yuoshi\Api\Helper\ValidationTrait;
use Xyng\Yuoshi\Helper\PermissionHelper;
use Xyng\Yuoshi\Model\TaskContentQuestAnswers;

class TaskContentQuestAnswersController extends JsonApiController
{
    use ValidationTrait;
    protected $allowedPagingParameters = ['offset', 'limit'];

    public function index(ServerRequestInterface $request, ResponseInterface $response, $args) {
        $quest_id = $args['id'] ?? null;

        $quest_ids = $quest_id ? [$quest_id] : [];

        if (!$quest_ids) {
            $filters = $this->getQueryParameters()->getFilteringParameters();
            $quest_ids = explode(',', $filters['task'] ?? '');
        }

        $tasks = TaskContentQuestAnswerAuthority::findFiltered($quest_ids, $this->getUser($request));

        list($offset, $limit) = $this->getOffsetAndLimit();

        return $this->getPaginatedContentResponse(
            array_slice($tasks, $offset, $limit),
            count($tasks)
        );
    }

    public function show(ServerRequestInterface $request, ResponseInterface $response, $args) {
        $quest_id = $args['quest_id'] ?? null;
        $answer_id = $args['answer_id'] ?? null;

        if (!$answer_id) {
            throw new RecordNotFoundException();
        }

        $quest = TaskContentQuestAnswerAuthority::findOneFiltered($answer_id, $this->getUser($request), [], [
            'yuoshi_task_content_quest_answers.quest_id' => $quest_id
        ]);

        if (!$quest) {
            throw new RecordNotFoundException();
        }

        return $this->getContentResponse($quest);
    }

    public function create(ServerRequestInterface $request, ResponseInterface $response) {
        $validated = $this->validate($request, true);
        $data = new JsonApiDataHelper($validated);

        $quest_id = $data->getRelationId('quest');

        if (!$quest_id) {
            throw new RecordNotFoundException();
        }

        $quest = TaskContentQuestAuthority::findOneFiltered($quest_id, $this->getUser($request), PermissionHelper::getMasters('dozent'));

        if (!$quest) {
            throw new RecordNotFoundException();
        }

        $answer = TaskContentQuestAnswers::build(
            $data->getAttributes([
                'content',
                'is_correct',
                'sort'
            ])
        );

        $answer->quest_id = $quest->id;

        if (!$answer->store()) {
            throw new InternalServerError("could not persist entity");
        }

        return $this->getContentResponse($answer, 201);
    }

    public function update(ServerRequestInterface $request, ResponseInterface $response, $args) {
        $answer_id = $args['answer_id'] ?? null;

        $validated = $this->validate($request, false);
        $data = new JsonApiDataHelper($validated);

        $answer = TaskContentQuestAnswerAuthority::findOneFiltered($answer_id, $this->getUser($request), PermissionHelper::getMasters('dozent'));

        if (!$answer) {
            throw new RecordNotFoundException();
        }

        $attributes = $data->getAttributes([
            'content',
            'is_correct',
            'sort'
        ]);
        foreach ($attributes as $key => $value) {
            $answer->{$key} = $value;
        }

        if ($answer->isDirty() && !$answer->store()) {
            throw new InternalServerError("could not persist entity");
        }

        return $this->getContentResponse($answer);
    }

    public function delete(ServerRequestInterface $request, ResponseInterface $response, $args) {
        $answer_id = $args['answer_id'] ?? null;

        if (!$answer_id) {
            throw new RecordNotFoundException();
        }

        $answer = TaskContentQuestAnswerAuthority::findOneFiltered($answer_id, $this->getUser($request), PermissionHelper::getMasters('dozent'));

        if (!$answer->delete()) {
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
                ->rule('required', 'data.relationships.quest.data.id');
        }

        return $validator
            ->rule('required', 'data.attributes.content')
            ->rule('required', 'data.attributes.is_correct')
            ->rule('boolean', 'data.attributes.is_correct')
            ->rule('numeric', 'data.attributes.sort')
        ;
    }
}
