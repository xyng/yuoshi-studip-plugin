<?php
namespace Xyng\Yuoshi\Api\Controller;


use JsonApi\JsonApiController;
use JsonApi\JsonApiIntegration\JsonApiTrait;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use SimpleORMap;
use Xyng\Yuoshi\Model\Packages;
use Xyng\Yuoshi\Model\Tasks;

class TasksController extends JsonApiController
{
    public function index(ServerRequestInterface $request, ResponseInterface $response, $args) {
        ['id' => $id] = $args;
        $tasks = Tasks::findByPackage_id($id);

        list($offset, $limit) = $this->getOffsetAndLimit();

        return $this->getPaginatedContentResponse(
            array_slice($tasks, $offset, $limit),
            count($tasks)
        );
    }
}
