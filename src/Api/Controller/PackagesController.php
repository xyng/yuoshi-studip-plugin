<?php
namespace Xyng\Yuoshi\Api\Controller;

use JsonApi\Errors\RecordNotFoundException;
use JsonApi\JsonApiController;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;

use Xyng\Yuoshi\Model\Packages;

class PackagesController extends JsonApiController
{
    public function index(ServerRequestInterface $request, ResponseInterface $response, $args) {
        ['id' => $id] = $args;
        $packages = Packages::findByCourse_id($id);

        list($offset, $limit) = $this->getOffsetAndLimit();

        return $this->getPaginatedContentResponse(
            array_slice($packages, $offset, $limit),
            count($packages)
        );
    }

    public function show(ServerRequestInterface $request, ResponseInterface $response, $args) {
        ['id' => $id] = $args;
        $package = Packages::find($id);

        if (!$package) {
            throw new RecordNotFoundException();
        }

        return $this->getContentResponse($package);
    }
}
