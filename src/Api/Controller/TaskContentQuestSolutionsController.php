<?php
namespace Xyng\Yuoshi\Api\Controller;

use Cake\Utility\Hash;
use JsonApi\Errors\ConflictException;
use JsonApi\Errors\InternalServerError;
use JsonApi\Errors\RecordNotFoundException;
use JsonApi\JsonApiController;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Slim\Http\Body;
use Slim\Http\Stream;
use User;
use Valitron\Validator;
use Xyng\Yuoshi\Authority\TaskAuthority;
use Xyng\Yuoshi\Authority\TaskContentAuthority;
use Xyng\Yuoshi\Authority\TaskContentQuestAuthority;
use Xyng\Yuoshi\Authority\TaskContentQuestSolutionAuthority;
use Xyng\Yuoshi\Authority\TaskContentSolutionAuthority;
use Xyng\Yuoshi\Authority\TaskSolutionAuthority;
use Xyng\Yuoshi\Api\Helper\JsonApiDataHelper;
use Xyng\Yuoshi\Api\Helper\ValidationTrait;
use Xyng\Yuoshi\Helper\AuthorityHelper;
use Xyng\Yuoshi\Helper\HtmlSanitizerFactory;
use Xyng\Yuoshi\Helper\PermissionHelper;
use Xyng\Yuoshi\Model\TaskContentQuestAnswers;
use Xyng\Yuoshi\Model\TaskContentQuests;
use Xyng\Yuoshi\Model\TaskContents;
use Xyng\Yuoshi\Model\Tasks;
use Xyng\Yuoshi\Model\UserTaskContentQuestSolutionAnswers;
use Xyng\Yuoshi\Model\UserTaskContentQuestSolutions;
use Xyng\Yuoshi\Model\UserTaskContentSolutions;
use Xyng\Yuoshi\Model\UserTaskSolutions;
use Xyng\Yuoshi\Api\Schema\TaskContentQuestSolutions;
use Xyng\Yuoshi\Api\Schema\TaskSolutions;

class TaskContentQuestSolutionsController extends JsonApiController
{
    use ValidationTrait;

    protected $allowedPagingParameters = ['offset', 'limit'];

    public function index(ServerRequestInterface $request, ResponseInterface $response, $args)
    {
        $quest_solution_id = $args['quest_solution_id'] ?? null;

        $filters = $this->getQueryParameters()->getFilteringParameters();
        if (!$quest_solution_id) {
            $quest_solution_id = $filters['task_solution'] ?? null;
        }

        if (!$quest_solution_id) {
            throw new \InvalidArgumentException("Cannot select TaskContentQuestSolutions without task filter.");
        }

        $solutions = TaskContentQuestSolutionAuthority::findFiltered([$quest_solution_id], $this->getUser($request));

        list($offset, $limit) = $this->getOffsetAndLimit();

        return $this->getPaginatedContentResponse(
            array_slice($solutions, $offset, $limit),
            count($solutions)
        );
    }

    protected function getSolution(ServerRequestInterface $request, ResponseInterface $response, $args): UserTaskContentQuestSolutions
    {
        $quest_solution_id = $args['quest_solution_id'] ?? null;

        if (!$quest_solution_id) {
            throw new RecordNotFoundException();
        }

        $solution = TaskContentQuestSolutionAuthority::findOneFiltered($quest_solution_id, $this->getUser($request), PermissionHelper::getMasters('dozent'));

        if (!$solution) {
            throw new RecordNotFoundException();
        }

        return $solution;
    }

    public function show(ServerRequestInterface $request, ResponseInterface $response, $args)
    {
        $solution = $this->getSolution($request, $response, $args);

        return $this->getContentResponse($solution);
    }

    public function create(ServerRequestInterface $request, ResponseInterface $response, $args)
    {
        $validated = $this->validate($request, true);
        $data = new JsonApiDataHelper($validated);

        /** @var User $user */
        $user = $this->getUser($request);

        /** @var TaskContentQuests $quest */
        $quest = TaskContentQuestAuthority::findOneFiltered($data->getRelationId('quest'), $user);

        if (!$quest) {
            throw new RecordNotFoundException();
        }

        $solutionConds = [
            'yuoshi_user_task_solutions.finished is null',
            'yuoshi_user_task_solutions.user_id' => $user->id,
        ];

        $content_id = $quest->content_id;
        $contentSolution = UserTaskContentSolutions::findOneWithQuery(
            AuthorityHelper::getFilterQuery(TaskContentSolutionAuthority::getFilter(), 'yuoshi_user_task_content_solutions.content_id', $content_id, $user, [], $solutionConds)
        );

        if (!$contentSolution) {
            $task_id = $quest->content->task_id;
            $taskSolution = UserTaskSolutions::findOneWithQuery(
                AuthorityHelper::getFilterQuery(
                    TaskSolutionAuthority::getFilter(),
                    'yuoshi_user_task_solutions.task_id',
                    $task_id,
                    $user,
                    [],
                    $solutionConds
                )
            );

            if (!$taskSolution) {
                // this should not happen to normal saves - a solution is created when the task is requested
                throw new RecordNotFoundException();
            }

            // no Authority-Lookup necessary for TaskContent as we know that the user can see quest, which requires him to see the TaskContent.
            $contentSolution = UserTaskContentSolutions::build([
                'solution_id' => $taskSolution->id,
                'content_id' => $content_id,
            ]);

            if (!$contentSolution->store()) {
                throw new InternalServerError('could not persist entity');
            }
        }

        // check if the user can submit another solution attempt in this run.
        $previousQuestSolutionAttempts = UserTaskContentQuestSolutions::countWithQuery([
            'conditions' => [
                'content_solution_id' => $contentSolution->id,
                'quest_id' => $quest->id,
            ]
        ]);

        // check if the user has already seen the solution for this question in this run
        $sawSolution = (bool) UserTaskContentQuestSolutions::countWithQuery([
            'conditions' => [
                'content_solution_id' => $contentSolution->id,
                'quest_id' => $quest->id,
                'sent_solution' => true
            ]
        ]);

        if ($sawSolution) {
            throw new ConflictException();
        }
        $rawUserAnswers = $data->getRelation('answers');

        // We will put this in later on
        // if (!$quest->multiple) {
        //     this quest only accepts one answer. we will take the first one.
        //     $rawUserAnswers = array_slice($rawUserAnswers, 0, 1);
        // }

        $sanitizer = HtmlSanitizerFactory::create();

        /** @var UserTaskContentQuestSolutionAnswers[] $userAnswers */
        $userAnswers = array_map(function ($rawUserAnswer) use ($quest, $sanitizer) {
            $userAnswerData = new JsonApiDataHelper($rawUserAnswer);

            $custom = $quest->custom_answer ? $userAnswerData->getAttribute('custom') : null;
            if ($custom) {
                $custom = $sanitizer->sanitize($custom);
            }

            return UserTaskContentQuestSolutionAnswers::build([
                'answer_id' => $userAnswerData->getRelationId('answer'),
                'sort' => $userAnswerData->getAttribute('sort'),
                'custom' => $custom,
            ]);
        }, $rawUserAnswers);

        /** @var \SimpleORMapCollection|TaskContentQuestAnswers[] $correct_answers */
        $correct_answers = $quest->answers->filter(function (TaskContentQuestAnswers $answer) {
            return $answer->is_correct;
        });

        $correct_answer_count = $correct_answers->count();
        $correct_user_answer_count = 0;

        $sort_weight = 0.3;
        $score = 0;


        // add points for each correct answer
        foreach ($correct_answers as $correctAnswer) {
            /** @var UserTaskContentQuestSolutionAnswers $solution */
            $extract = Hash::extract($userAnswers, "{n}[answer_id=$correctAnswer->id]");
            $solution = Hash::extract($userAnswers, "{n}[answer_id=$correctAnswer->id]")[0] ?? null;

            if (!$solution) {
                continue;
            }

            // give partial points for every correct answer
            // TODO: problem: if user selects all answers, he also selects all correct ones. Maybe divide by max of correct and user answer count?
            $answerScore = (1 / $correct_answer_count);

            // decrease points if answer is not in the correct spot
            if ($quest->require_order && $solution->sort != $correctAnswer->sort) {
                $answerScore *= 1 - $sort_weight;
            } else {
                $correct_user_answer_count += 1;
            }

            $score += $answerScore;
        }

        $userSentCustomAnswer = false;
        foreach ($userAnswers as $userAnswer) {
            if ($userAnswer->custom) {
                $userSentCustomAnswer = true;
                break;
            }
        }

        $questSolution = UserTaskContentQuestSolutions::build([
            'content_solution_id' => $contentSolution->id,
            'quest_id' => $quest->id,
            'score' => $score,
            'is_correct' => ($quest->custom_answer && $userSentCustomAnswer)
                || $correct_answer_count === $correct_user_answer_count,
            'sent_solution' => false,
        ]);

        $questSolution->answers = $userAnswers;

        if (!$questSolution->store()) {
            throw new InternalServerError("could not store entity");
        }

        TaskSolutionAuthority::checkAndMarkDone($questSolution->content_solution->task_solution);

        return $this->getContentResponse($questSolution);
    }

    public function requestSampleSolution(ServerRequestInterface $request, ResponseInterface $response, $args)
    {
        $quest_solution_id = $args['quest_solution_id'] ?? null;

        $questSolution = TaskContentQuestSolutionAuthority::findOneFiltered($quest_solution_id, $this->getUser($request), [], []);

        if (!$questSolution) {
            throw new RecordNotFoundException();
        }

        $answers = $questSolution->quest->answers;
        $answers->uasort(function (TaskContentQuestAnswers $a, TaskContentQuestAnswers $b) {
            return $a->sort - $b->sort;
        });

        $sampleSolution = [
            'quest_id' => $questSolution->quest_id,
            'answers' => array_values($answers->map(function (TaskContentQuestAnswers $answer) {
                return [
                    'id' => $answer->id,
                    'sort' => (int) $answer->sort,
                    'is_correct' => (bool) $answer->is_correct,
                    'content' => $answer->content,
                ];
            })),
        ];

        $body = $response->getBody();
        $body->write(json_encode($sampleSolution));

        return $response
            ->withStatus(200)
            ->withHeader('Content-Type', 'application/json')
            ->withBody($body);
    }

    /**
     * @inheritDoc
     */
    protected function buildResourceValidationRules(Validator $validator, $new = false): Validator
    {
        if ($new) {
            $validator->rule('required', 'data.relationships.quest.data.id');
        }

        $validator
            ->rule('requiredWithout', 'data.relationships.answers.*.data.relationships.answer.data.id', 'data.relationships.answers.*.data.attributes.custom')
            ->rule('requiredWithout', 'data.relationships.answers.*.data.attributes.custom', 'data.relationships.answers.*.data.relationships.answer.data.id')
        ;

        return $validator;
    }
}
