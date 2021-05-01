<?php
namespace Xyng\Yuoshi\Api\Controller;

use JsonApi\Errors\AuthorizationFailedException;
use JsonApi\Errors\InternalServerError;
use JsonApi\Errors\RecordNotFoundException;
use JsonApi\JsonApiController;
use Xyng\Yuoshi\Api\Helper\JsonApiDataHelper;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;

use Xyng\Yuoshi\Authority\LearningObjectiveAuthority;
use Xyng\Yuoshi\Authority\PackageAuthority;
use Xyng\Yuoshi\Helper\QueryField;
use Xyng\Yuoshi\Model\LearningObjective;

class LearningObjectivesController extends JsonApiController
{
    protected $allowedPagingParameters = ['offset', 'limit'];
    protected $allowedFilteringParameters = ['package'];
    protected $allowedIncludePaths = [];

    public function index(ServerRequestInterface $request, ResponseInterface $response, $args)
    {
        $package_id = $args['id'] ?? null;
        $filters = $this->getQueryParameters()->getFilteringParameters();
        
        if (!$package_id) {
            throw new \InvalidArgumentException("Cannot select Package.");
        }
        // package_id in findFiltered?
        $learning_objectives = LearningObjectiveAuthority::findFiltered([$package_id], $this->getUser($request));
        list($offset, $limit) = $this->getOffsetAndLimit();

        return $this->getPaginatedContentResponse(
            array_slice($learning_objectives, $offset, $limit),
            count($learning_objectives)
        );
    }

    public function show(ServerRequestInterface $request, ResponseInterface $response, $args)
    {
        $id = $args['id'] ?? null;
        if (!id) {
            $filters = $this->getQueryParameters()->getFilteringParameters();
            $id = $filters['id'] ?? null;
        }

        $user = $this->getUser($request);
        $learning_objective = LearningObjectiveAuthority::findOneFiltered($id, $user);
    }

    public function create(ServerRequestInterface $request, ResponseInterface $response, $args)
    {
        $validated = $this->validate($request, true);
        $data = new JsonApiDataHelper($validated);
        $attributes = $data->getAttributes(['title', 'description', 'image', 'sort']);
        $package_id = $data->getRelation('package')['data']['id'] ?? null;

        /** @var Package|null $package */
        $package = PackageAuthority::findOneFiltered($package_id, $this->getUser($request), PermissionHelper::getMasters('dozent'));

        if ($package == null) {
            throw new RecordNotFoundException();
        }

        if (!PackageAuthority::canEditPackage($this->getUser($request), $package)) {
            throw new AuthorizationFailedException();
        }

        $learning_objective = LearningObjective::build(
            $attributes
            +
            [
                'package_id' => $package_id,
            ]
        );
        if (!$learning_objective->store()) {
            throw new InternalServerError("could not persist entity");
        }
        
        return $this->getContentResponse($learning_objective);
    }
}
