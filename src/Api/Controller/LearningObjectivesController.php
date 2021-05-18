<?php
namespace Xyng\Yuoshi\Api\Controller;

use JsonApi\Errors\AuthorizationFailedException;
use JsonApi\Errors\InternalServerError;
use JsonApi\Errors\RecordNotFoundException;
use JsonApi\JsonApiController;
use Xyng\Yuoshi\Api\Helper\JsonApiDataHelper;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Xyng\Yuoshi\Api\Helper\ValidationTrait;
use Valitron\Validator;

use Xyng\Yuoshi\Authority\LearningObjectiveAuthority;
use Xyng\Yuoshi\Authority\PackageAuthority;
use Xyng\Yuoshi\Helper\PermissionHelper;
use Xyng\Yuoshi\Model\LearningObjectives;
use Xyng\Yuoshi\Model\Stations;

class LearningObjectivesController extends JsonApiController
{
    use ValidationTrait;

    protected $allowedPagingParameters = ['offset', 'limit'];
    protected $allowedFilteringParameters = ['package', 'sort'];
    protected $allowedIncludePaths = [];

    public function index(ServerRequestInterface $request, ResponseInterface $response, $args)
    {
        $package_id = $args['id'] ?? null;
        $filters = $this->getQueryParameters()->getFilteringParameters();
        
        if (!$package_id) {
            throw new \InvalidArgumentException("Cannot select Package.");
        }
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
        if (!$id) {
            $filters = $this->getQueryParameters()->getFilteringParameters();
            $id = $filters['id'] ?? null;
        }

        $user = $this->getUser($request);
        $learning_objective = LearningObjectiveAuthority::findOneFiltered($id, $user);
        
        if (!$learning_objective) {
            throw new RecordNotFoundException();
        }

        return $this->getContentResponse($learning_objective);
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

        $learning_objective = LearningObjectives::build(
            $attributes
            +
            [
                'package_id' => $package_id,
            ]
        );
        $learning_objective->sort = LearningObjectives::nextSort($package->id);

        if (!$learning_objective->store()) {
            throw new InternalServerError("could not persist entity");
        }

           $station = Stations::build(
            [
                'package_id' => $package_id,
                'title' => $learning_objective->title,
                'slug' => strtolower($learning_objective->title),
                'learning_objective_id' => $learning_objective->id,
            ]
        );
        $station->sort = Stations::nextSort($package->id);
        $station->package_id = $package->id;

        if (!$station->store()) {
            throw new InternalServerError("could not save belonging station");
        }
        // create beloning station for objective
        
        return $this->getContentResponse($learning_objective);
    }

    public function update(ServerRequestInterface $request, ResponseInterface $response, $args)
    {
        $learning_objective_id = $args['id'] ?? null;
        if ($learning_objective_id === null) {
            throw new RecordNotFoundException();
        }

        $learning_objective= LearningObjectiveAuthority::findOneFiltered($learning_objective_id, $this->getUser($request), PermissionHelper::getMasters('dozent'));
        
        if (!$learning_objective_id) {
            throw new RecordNotFoundException();
        }

        $validated = $this->validate($request);
        $data = new JsonApiDataHelper($validated);

        if ($title = $data->getAttribute('title')) {
            $learning_objective->title = $title;
        }

        if ($description = $data->getAttribute('description')) {
            $learning_objective->description = $description;
        }

        if ($image = $data->getAttribute('image')) {
            $learning_objective->image = $image;
        }
        
        if ($sort = $data->getAttribute('sort')) {
            $learning_objective->sort = $sort;
        }

        if ($learning_objective->isDirty() && !$learning_objective->store()) {
            throw new InternalServerError("could not update package");
        }

        return $this->getContentResponse($learning_objective);
    }

    /**
     * @inheritDoc
     */
    protected function buildResourceValidationRules(Validator $validator, $new = false): Validator
    {
        $validator
            ->rule('required', 'data.attributes.title')
            ->rule('required', 'data.attributes.description')
            ->rule('numeric', 'data.attributes.sort');

        if ($new) {
            $validator
                ->rule('required', 'data.relationships.package.data.id');
        }

        return $validator;
    }
}
