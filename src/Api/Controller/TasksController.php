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
    protected $allowedPagingParameters = ['offset', 'limit'];
    protected $allowedFilteringParameters = ['sequence'];

    public function index(ServerRequestInterface $request, ResponseInterface $response, $args) {
        $sequence = $request->getQueryParams()['sequence'] ?? 0;

        ['id' => $id] = $args;
        $where = [
            'package_id' => $id,
            'sequence' => $sequence
        ];

        $tasks = Tasks::findWhere($where);

        list($offset, $limit) = $this->getOffsetAndLimit();

        return $this->getPaginatedContentResponse(
            array_slice($tasks, $offset, $limit),
            count($tasks)
        );
    }
}
