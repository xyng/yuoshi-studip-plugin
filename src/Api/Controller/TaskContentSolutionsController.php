<?php
namespace Xyng\Yuoshi\Api\Controller;

use JsonApi\Errors\RecordNotFoundException;
use JsonApi\JsonApiController;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Xyng\Yuoshi\Api\Authority\TaskContentSolutionAuthority;
use Xyng\Yuoshi\Helper\PermissionHelper;
use Xyng\Yuoshi\Model\UserTaskContentSolutions;

class TaskContentSolutionsController extends JsonApiController {
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
}
