<?php
namespace Xyng\Yuoshi\Api\Controller;


use JsonApi\JsonApiController;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Xyng\Yuoshi\Model\TaskContentQuests;

class TaskContentQuestsController extends JsonApiController
{
    public function index(ServerRequestInterface $request, ResponseInterface $response, $args) {
        ['id' => $id] = $args;
        $tasks = TaskContentQuests::findByContent_id($id);

        list($offset, $limit) = $this->getOffsetAndLimit();

        return $this->getPaginatedContentResponse(
            array_slice($tasks, $offset, $limit),
            count($tasks)
        );
    }
}
