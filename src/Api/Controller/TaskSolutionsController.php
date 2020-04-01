<?php
namespace Xyng\Yuoshi\Api\Controller;

use Cake\Utility\Hash;
use JsonApi\Errors\InternalServerError;
use JsonApi\Errors\RecordNotFoundException;
use JsonApi\JsonApiController;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Valitron\Validator;
use Xyng\Yuoshi\Api\Authority\TaskAuthority;
use Xyng\Yuoshi\Api\Authority\TaskSolutionAuthority;
use Xyng\Yuoshi\Api\Helper\JsonApiDataHelper;
use Xyng\Yuoshi\Api\Helper\ValidationTrait;
use Xyng\Yuoshi\Helper\PermissionHelper;
use Xyng\Yuoshi\Model\TaskContentQuestAnswers;
use Xyng\Yuoshi\Model\Tasks;
use Xyng\Yuoshi\Model\UserTaskContentQuestSolutions;
use Xyng\Yuoshi\Model\UserTaskSolutions;

class TaskSolutionsController extends JsonApiController
{
    use ValidationTrait;

    protected $allowedPagingParameters = ['offset', 'limit'];
    protected $allowedFilteringParameters = ['task'];
    protected $allowedIncludePaths = [
        'task',
        'user',
        'content_solutions',
        'content_solutions.content',
        'content_solutions.quest_solutions',
        'content_solutions.quest_solutions.quest',
        'content_solutions.quest_solutions.answer',
        'content_solutions.quest_solutions.answer.quest',
    ];

    public function index(ServerRequestInterface $request, ResponseInterface $response, $args) {
        $task_id = $args['task_id'] ?? null;

        $filters = $this->getQueryParameters()->getFilteringParameters();
        if (!$task_id) {
            $task_id = $filters['task'] ?? null;
        }

        if (!$task_id) {
            throw new \InvalidArgumentException("Cannot select TaskSolutions without task filter.");
        }

        $cond = [];

        // TODO: check for actual course permissions, not global ones
        if (!PermissionHelper::getPerm()->have_perm('dozent')) {
            $cond['yuoshi_user_task_solutions.user_id'] = $this->getUser($request)->id;
        }

        $solutions = TaskSolutionAuthority::findFiltered([$task_id], $this->getUser($request), PermissionHelper::getMasters('autor'), $cond);

        list($offset, $limit) = $this->getOffsetAndLimit();

        return $this->getPaginatedContentResponse(
            array_slice($solutions, $offset, $limit),
            count($solutions)
        );
    }

    public function create(ServerRequestInterface $request, ResponseInterface $response, $args) {
        $validated = $this->validate($request, true);
        $data = new JsonApiDataHelper($validated);

        $task_id = $data->getRelationId('task');
        /** @var Tasks $task */
        $task = TaskAuthority::findOneFiltered($task_id, $this->getUser($request));

        if (!$task) {
            throw new RecordNotFoundException();
        }

        $content_solutions = [];
        $raw_content_solutions = $data->getHasManyMapped('content_solutions');
        foreach ($raw_content_solutions as $content_solution) {
            $content_id = $content_solution->getRelationId('content');

            $quest_solutions = [];
            $raw_quest_solutions = $content_solution->getHasManyMapped('content_quest_solutions');

            foreach ($raw_quest_solutions as $quest_solution) {
                $quest_id = $quest_solution->getRelationId('quest');

                /*
                    NOTE: the answer is not checked by intention.
                    there are some task-types (like drag) that require the user
                    to find the correct answer to a question.
                    in order to persist wrong instances, there may be entries with
                    non-matching quest_id and answer_id.
                */

                $quest_solutions[] = [
                    'quest_id' => $quest_id,
                    'answer_id' => $quest_solution->getRelationId('answer'),
                    'sort' => $quest_solution->getAttribute('sort'),
                    'custom' => $quest_solution->getAttribute('custom'),
                ];
            }

            $content_solutions[] = [
                'content_id' => $content_id,
                'value' => $content_solution->getAttribute('value') ?? null,
                'quest_solutions' => $quest_solutions,
            ];
        }

        // filter submitted solutions by contents and quests from db.
        $solutionsToSave = [];
        $sort_weight = 0.3;
        $total_questions = 0;
        $score = 0;
        foreach ($task->contents as $content) {
            // only check first submitted solution (there shouldn't be more than one anyway)
            $contentSolution = Hash::extract($content_solutions, "{n}[content_id=$content->id]")[0] ?? [];

            $questSolutionsToSave = [];
            foreach ($content->quests as $quest) {
                $total_questions += 1;

                $questSolutions = Hash::extract($contentSolution, "quest_solutions.{n}[quest_id=$quest->id]");

                if (!$quest->multiple) {
                    // this quest only accepts one answer. we will take the first one.
                    $questSolutions = array_slice($questSolutions,0, 1);
                }

                /** @var \SimpleORMapCollection|TaskContentQuestAnswers[] $correct_answers */
                $correct_answers = $quest->answers->filter(function (TaskContentQuestAnswers $answer) {
                    return $answer->is_correct;
                });

                $correct_answer_count = $correct_answers->count();

                foreach ($correct_answers as $answer) {
                    /** @var UserTaskContentQuestSolutions $solution */
                    $solution = Hash::extract($questSolutions, "{n}[answer_id=$answer->id]")[0] ?? null;

                    if (!$solution) {
                        continue;
                    }

                    // give partial points for every correct answer
                    $answerScore = (1 / $correct_answer_count);

                    // first part of points for selecting the correct answer for the correct question (e.g. drag-task)
                    $score += $answerScore * (1 - $sort_weight);

                    // second part of points for correct sorting of answer (always added when ordering is not required)
                    if (!$quest->require_order || $solution->sort === $answer->sort) {
                        // this division is save - if correct_answer_count was 0 this loop would not happen
                        $score += $answerScore * $sort_weight;
                    }
                }

                $questSolutionsToSave = array_merge($questSolutionsToSave, $questSolutions);
            }

            if (!$contentSolution) {
                continue;
            }

            $contentSolution['quest_solutions'] = $questSolutionsToSave;

            $solutionsToSave[] = $contentSolution;
        }

        if (!$total_questions) {
            // tasks without questions have to be rated by professor
            $points = null;
        } else {
            $points = ($score / $total_questions) * $task->credits;
        }

        $result = UserTaskSolutions::import([
            'task_id' => $task_id,
            'user_id' => $this->getUser($request)->id,
            'content_solutions' => $solutionsToSave,
            'points' => $points,
        ]);

        $result->store();

        return $this->getContentResponse($result);
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

    public function show(ServerRequestInterface $request, ResponseInterface $response, $args) {
        $solution = $this->getSolution($request, $response, $args);

        $cond = [];

        // TODO: check for actual course permissions, not global ones
        if (!PermissionHelper::getPerm()->have_perm('dozent')) {
            $cond['yuoshi_user_task_solutions.user_id'] = $this->getUser($request)->id;
        }

        return $this->getContentResponse($solution, PermissionHelper::getMasters('autor'), $cond);
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
        if ($new) {
            $validator
                ->rule('required', 'data.relationships.task.data.id')
                ->rule('required', 'data.relationships.content_solutions.*.data.relationships.content.data.id')
                ->rule('numeric', 'data.relationships.content_solutions.*.data.relationships.content_quest_solutions.*.data.attributes.sort')
                ->rule('required', 'data.relationships.content_solutions.*.data.relationships.content_quest_solutions.*.data.relationships.answer.data.id')
                ->rule('required', 'data.relationships.content_solutions.*.data.relationships.content_quest_solutions.*.data.relationships.quest.data.id')
            ;
        } else {
            $validator
                ->rule('numeric', 'data.attributes.points')
            ;
        }

        return $validator;
    }
}
