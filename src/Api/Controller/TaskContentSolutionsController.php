<?php
namespace Xyng\Yuoshi\Api\Controller;

use HtmlSanitizer\Sanitizer;
use JsonApi\Errors\ConflictException;
use JsonApi\Errors\InternalServerError;
use JsonApi\Errors\RecordNotFoundException;
use JsonApi\JsonApiController;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use User;
use Valitron\Validator;
use Xyng\Yuoshi\Api\Authority\TaskContentAuthority;
use Xyng\Yuoshi\Api\Authority\TaskContentSolutionAuthority;
use Xyng\Yuoshi\Api\Authority\TaskSolutionAuthority;
use Xyng\Yuoshi\Api\Helper\JsonApiDataHelper;
use Xyng\Yuoshi\Api\Helper\ValidationTrait;
use Xyng\Yuoshi\Helper\AuthorityHelper;
use Xyng\Yuoshi\Helper\HtmlSanitizerFactory;
use Xyng\Yuoshi\Helper\PermissionHelper;
use Xyng\Yuoshi\Model\TaskContents;
use Xyng\Yuoshi\Model\UserTaskContentSolutions;
use Xyng\Yuoshi\Model\UserTaskSolutions;

class TaskContentSolutionsController extends JsonApiController {
    use ValidationTrait;

    public function index(ServerRequestInterface $request, ResponseInterface $response, $args) {
        $task_solution_id = $args['task_solution_id'] ?? null;

        $filters = $this->getQueryParameters()->getFilteringParameters();
        if (!$task_solution_id) {
            $task_solution_id = $filters['task_solution'] ?? null;
        }

        if (!$task_solution_id) {
            throw new \InvalidArgumentException("Cannot select TaskContentSolutions without task filter.");
        }

        $solutions = TaskContentSolutionAuthority::findFiltered([$task_solution_id], $this->getUser($request));

        list($offset, $limit) = $this->getOffsetAndLimit();

        return $this->getPaginatedContentResponse(
            array_slice($solutions, $offset, $limit),
            count($solutions)
        );
    }

    protected function getSolution(ServerRequestInterface $request, ResponseInterface $response, $args): UserTaskContentSolutions {
        $content_solution_id = $args['content_solution_id'] ?? null;

        if (!$content_solution_id) {
            throw new RecordNotFoundException();
        }

        $solution = TaskContentSolutionAuthority::findOneFiltered($content_solution_id, $this->getUser($request), PermissionHelper::getMasters('dozent'));

        if (!$solution) {
            throw new RecordNotFoundException();
        }

        return $solution;
    }

    public function show(ServerRequestInterface $request, ResponseInterface $response, $args) {
        $solution = $this->getSolution($request, $response, $args);

        return $this->getContentResponse($solution);
    }

    public function create(ServerRequestInterface $request, ResponseInterface $response, $args) {
        $validated = $this->validate($request);
        $data = new JsonApiDataHelper($validated);

        /** @var User $user */
        $user = $this->getUser($request);

        $content_id = $data->getRelationId('content');
        /** @var TaskContents $content */
        $content = TaskContentAuthority::findOneFiltered($content_id, $user);

        if (!$content) {
            throw new RecordNotFoundException();
        }

        /** @var UserTaskSolutions|null $taskSolution */
        $taskSolution = UserTaskSolutions::findOneWithQuery(
            AuthorityHelper::getFilterQuery(
                TaskSolutionAuthority::getFilter(),
                'yuoshi_user_task_solutions.task_id',
                $content->task_id,
                $user,
                [],
                [
                    'yuoshi_user_task_solutions.finished is null',
                    'yuoshi_user_task_solutions.user_id' => $user->id,
                ]
            )
        );

        if (!$taskSolution) {
            // this should not happen to normal saves - a solution is created when the task is requested
            throw new RecordNotFoundException();
        }

        $existing_content_solution = UserTaskContentSolutions::findOneWhere([
            'solution_id' => $taskSolution->id,
            'content_id' => $data->getRelationId('content'),
        ]);

        if ($existing_content_solution) {
            // TODO: find a better exception than tis?
            throw new ConflictException();
        }

        $value = $data->getAttribute('value');

        if ($value) {
            if (!is_string($value)) {
                $sanitizer = HtmlSanitizerFactory::create();

                array_walk_recursive($value, function (&$val) use ($sanitizer) {
                    $val = $sanitizer->sanitize($val);
                });
            } else {
                $value = [
                    'value' => $value
                ];
            }
        }

        $content_solution = UserTaskContentSolutions::build([
            'solution_id' => $taskSolution->id,
            'content_id' => $data->getRelationId('content'),
            'value' => $value,
        ]);

        if (!$content_solution->store()) {
            throw new InternalServerError('could not persist entity');
        }

        TaskSolutionAuthority::checkAndMarkDone($content_solution->task_solution);

        return $this->getContentResponse($content_solution);
    }

    /**
     * @inheritDoc
     */
    protected function buildResourceValidationRules(Validator $validator, $data): Validator
    {
        $validator
            ->rule('required', 'data.relationships.content.data.id')
            ->rule(function ($field, $value) {
                return !$value || is_string($value) || is_array($value);
            }, 'data.attributes.value')
        ;

        return $validator;
    }
}
