<?php
namespace Xyng\Yuoshi\Api\Controller;


use JsonApi\JsonApiController;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Xyng\Yuoshi\Model\TaskContentQuestAnswers;

class TaskContentQuestAnswersController extends JsonApiController
{
    public function index(ServerRequestInterface $request, ResponseInterface $response, $args) {
        ['id' => $id] = $args;
        $tasks = TaskContentQuestAnswers::findByQuest_id($id);

        list($offset, $limit) = $this->getOffsetAndLimit();

        return $this->getPaginatedContentResponse(
            array_slice($tasks, $offset, $limit),
            count($tasks)
        );
    }
}
