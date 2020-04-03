<?php
namespace Xyng\Yuoshi\Api\Controller;

use JsonApi\Errors\RecordNotFoundException;
use JsonApi\JsonApiController;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Xyng\Yuoshi\Api\Authority\TaskContentQuestSolutionAnswerAuthority;
use Xyng\Yuoshi\Helper\PermissionHelper;
use Xyng\Yuoshi\Model\UserTaskContentQuestSolutionAnswers;

class TaskContentQuestSolutionAnswersController extends JsonApiController {
    public function index(ServerRequestInterface $request, ResponseInterface $response, $args) {
        $quest_solution_id = $args['quest_solution_id'] ?? null;

        $filters = $this->getQueryParameters()->getFilteringParameters();
        if (!$quest_solution_id) {
            $quest_solution_id = $filters['task_solution'] ?? null;
        }

        if (!$quest_solution_id) {
            throw new \InvalidArgumentException("Cannot select TaskContentQuestSolutionAnswers without task filter.");
        }

        $solutions = TaskContentQuestSolutionAnswerAuthority::findFiltered([$quest_solution_id], $this->getUser($request));

        list($offset, $limit) = $this->getOffsetAndLimit();

        return $this->getPaginatedContentResponse(
            array_slice($solutions, $offset, $limit),
            count($solutions)
        );
    }

    protected function getSolution(ServerRequestInterface $request, ResponseInterface $response, $args): UserTaskContentQuestSolutionAnswers {
        $quest_solution_id = $args['quest_solution_id'] ?? null;

        if (!$quest_solution_id) {
            throw new RecordNotFoundException();
        }

        $solution = TaskContentQuestSolutionAnswerAuthority::findOneFiltered($quest_solution_id, $this->getUser($request), PermissionHelper::getMasters('dozent'));

        if (!$solution) {
            throw new RecordNotFoundException();
        }

        return $solution;
    }

    public function show(ServerRequestInterface $request, ResponseInterface $response, $args) {
        $solution = $this->getSolution($request, $response, $args);

        return $this->getContentResponse($solution);
    }
}
