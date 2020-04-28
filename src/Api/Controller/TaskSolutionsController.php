<?php
namespace Xyng\Yuoshi\Api\Controller;

use Cake\Utility\Hash;
use JsonApi\Errors\InternalServerError;
use JsonApi\Errors\RecordNotFoundException;
use JsonApi\JsonApiController;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use User;
use Valitron\Validator;
use Xyng\Yuoshi\Authority\TaskAuthority;
use Xyng\Yuoshi\Authority\TaskSolutionAuthority;
use Xyng\Yuoshi\Api\Helper\JsonApiDataHelper;
use Xyng\Yuoshi\Api\Helper\ValidationTrait;
use Xyng\Yuoshi\Helper\AuthorityHelper;
use Xyng\Yuoshi\Helper\PermissionHelper;
use Xyng\Yuoshi\Model\TaskContentQuestAnswers;
use Xyng\Yuoshi\Model\Tasks;
use Xyng\Yuoshi\Model\UserTaskContentQuestSolutions;
use Xyng\Yuoshi\Model\UserTaskSolutions;

class TaskSolutionsController extends JsonApiController
{
    use ValidationTrait;

    protected $allowedPagingParameters = ['offset', 'limit'];
    protected $allowedFilteringParameters = ['task', 'user'];
    protected $allowedIncludePaths = [
        'task',
        'user',
        'current_content_solution.current_quest',
        'current_content_solution.done_quests',
        'current_content_solution.content',
        'done_content_solutions.done_quests',
        'done_content_solutions.content',
        'content_solutions',
        'content_solutions.content',
        'content_solutions.quest_solutions',
        'content_solutions.quest_solutions.quest',
        'content_solutions.quest_solutions.answers',
        'content_solutions.quest_solutions.answers.answer',
        'content_solutions.quest_solutions.answers.answer.quest',
    ];

    public function index(ServerRequestInterface $request, ResponseInterface $response, $args) {
        $task_id = $args['task_id'] ?? null;

        $filters = $this->getQueryParameters()->getFilteringParameters();

        $task_ids = [];
        if (!$task_id) {
            if ($task_filters = $filters['task'] ?? null) {
                $task_ids = explode(',', $task_filters);
            }
        } else {
            $task_ids = [$task_id];
        }

        if (!$task_ids) {
            throw new \InvalidArgumentException("Cannot select TaskSolutions without task filter.");
        }

        $cond = [];

        if ($user_filters = $filters['user'] ?? null) {
            $cond['yuoshi_user_task_solutions.user_id in'] = explode(',', $user_filters);
        }

        // TODO: check for actual course permissions, not global ones
        if (!PermissionHelper::getPerm()->have_perm('dozent')) {
            $cond['yuoshi_user_task_solutions.user_id'] = $this->getUser($request)->id;
        }

        $solutions = TaskSolutionAuthority::findFiltered($task_ids, $this->getUser($request), PermissionHelper::getMasters('autor'), $cond);

        list($offset, $limit) = $this->getOffsetAndLimit();

        return $this->getPaginatedContentResponse(
            array_slice($solutions, $offset, $limit),
            count($solutions)
        );
    }

    protected function getSolution(ServerRequestInterface $request, ResponseInterface $response, $args, array $perms = [], array $conds = []): UserTaskSolutions {
        $task_solution_id = $args['task_solution_id'] ?? null;

        if (!$task_solution_id) {
            throw new RecordNotFoundException();
        }

        $solution = TaskSolutionAuthority::findOneFiltered($task_solution_id, $this->getUser($request), $perms, $conds);

        if (!$solution) {
            throw new RecordNotFoundException();
        }

        return $solution;
    }

    /**
     * Fetches currently active solution for given task_id or creates a new one
     *
     * @param ServerRequestInterface $request
     * @param ResponseInterface $response
     * @param $args
     * @return \JsonApi\JsonApiIntegration\Response
     */
    public function getCurrentSolution(ServerRequestInterface $request, ResponseInterface $response, $args) {
        $task_id = $args['task_id'] ?? null;

        if (!$task_id) {
            throw new RecordNotFoundException();
        }

        /** @var User $user */
        $user = $this->getUser($request);

        /** @var Tasks|null $task */
        $task = TaskAuthority::findOneFiltered($task_id, $user);

        if (!$task) {
            throw new RecordNotFoundException();
        }

        $solution = UserTaskSolutions::findOneWithQuery(
            AuthorityHelper::getFilterQuery(
                TaskSolutionAuthority::getFilter(),
                'yuoshi_tasks.id',
                $task_id,
                $user,
                [],
                [
                    'yuoshi_user_task_solutions.finished is null',
                    'yuoshi_user_task_solutions.user_id' => $user->id,
                ]
            )
        );

        if (!$solution) {
            $solution = UserTaskSolutions::build([
                'task_id' => $task->id,
                'user_id' => $user->id,
            ]);

            if (!$solution->store()) {
                throw new InternalServerError("could not persist entity");
            }
        }

        return $this->getContentResponse($solution);
    }

    public function show(ServerRequestInterface $request, ResponseInterface $response, $args) {
        $solution = $this->getSolution($request, $response, $args);

        $cond = [];

        // TODO: check for actual course permissions, not global ones
        if (!PermissionHelper::getPerm()->have_perm('dozent')) {
            $cond['yuoshi_user_task_solutions.user_id'] = $this->getUser($request)->id;
        }

        return $this->getContentResponse($solution);
    }

    public function update(ServerRequestInterface $request, ResponseInterface $response, $args) {
        $solution = $this->getSolution($request, $response, $args, PermissionHelper::getMasters('dozent'));

        $validated = $this->validate($request);
        $data = new JsonApiDataHelper($validated);

        $solution->points = $data->getAttribute('points');

        if (!$solution->store()) {
            throw new InternalServerError("could not persist entity");
        }

        return $this->getContentResponse($solution);
    }

    /**
     * @inheritDoc
     */
    protected function buildResourceValidationRules(Validator $validator, $new = false): Validator
    {
        $validator
            ->rule('numeric', 'data.attributes.points')
        ;

        return $validator;
    }
}
