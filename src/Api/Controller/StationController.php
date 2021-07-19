<?php
namespace Xyng\Yuoshi\Api\Controller;

use JsonApi\Errors\AuthorizationFailedException;
use JsonApi\Errors\InternalServerError;
use JsonApi\Errors\RecordNotFoundException;
use JsonApi\JsonApiController;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;

use Valitron\Validator;
use Xyng\Yuoshi\Authority\StationAuthority;
use Xyng\Yuoshi\Authority\PackageAuthority;

use Xyng\Yuoshi\Api\Helper\JsonApiDataHelper;
use Xyng\Yuoshi\Api\Helper\ValidationTrait;
use Xyng\Yuoshi\Helper\AuthorityHelper;
use Xyng\Yuoshi\Helper\PermissionHelper;
use Xyng\Yuoshi\Helper\QueryField;
use Xyng\Yuoshi\Model\LearningObjectives;
use Xyng\Yuoshi\Model\stations;

class StationController extends JsonApiController
{
    use ValidationTrait;

    protected $allowedFilteringParameters = ['package', 'sort', 'station'];
    protected $allowedPagingParameters = ['offset', 'limit'];
    protected $allowedIncludePaths = ['stationTotalProgress', 'stationUserProgress', 'stationUserProgress.user', 'station', 'package'];

    public function index(ServerRequestInterface $request, ResponseInterface $response, $args)
    {
        $package_id = $args['id'] ?? null;

        $filters = $this->getQueryParameters()->getFilteringParameters();
        if (!$package_id) {
            $package_id = $filters['package'] ?? null;
        }

        $conditions = [];
        if ($sort = ($filters['sort'] ?? null)) {
            $conditions['sort'] = $sort;
        }

        $user = $this->getUser($request);
        $stations = StationAuthority::findFiltered([$package_id], $user, [], [
            'conditions' => $conditions,
            'order' => 'yuoshi_stations.sort ASC'
        ]);


        list($offset, $limit) = $this->getOffsetAndLimit();

        return $this->getPaginatedContentResponse(
            array_slice($stations, $offset, $limit),
            count($stations)
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
        $station = StationAuthority::findOneFiltered($id, $user);

        if (!$station) {
            throw new RecordNotFoundException();
        }

        return $this->getContentResponse($station);
    }

    public function getStationsForLearningObjective(ServerRequestInterface $request, ResponseInterface $response, $args)
    {
        $learning_objective_id = $args['learning_objective_id'] ?? null;
        if (!$learning_objective_id) {
            $learning_objective_id = $filters['package'] ?? null;
        }

        $stations = Stations::findBySQL('learning_objective_id = ?', [$learning_objective_id]);
        list($offset, $limit) = $this->getOffsetAndLimit();
        return $this->getPaginatedContentResponse(
            array_slice($stations, $offset, $limit),
            count($stations)
        );
    }

    public function create(ServerRequestInterface $request, ResponseInterface $response, $args)
    {
        $validated = $this->validate($request, true);
        $data = new JsonApiDataHelper($validated);
        $attributes = $data->getAttributes(['title', 'slug', 'sort']);
        $package_id = $data->getRelation('package')['data']['id'] ?? null;

        /** @var Package|null $package */
        $package = PackageAuthority::findOneFiltered($package_id, $this->getUser($request), PermissionHelper::getMasters('dozent'));

        if ($package == null) {
            throw new RecordNotFoundException();
        }

        if (!PackageAuthority::canEditPackage($this->getUser($request), $package)) {
            throw new AuthorizationFailedException();
        }

        $station = stations::build($attributes);
        $station->sort = stations::nextSort($package->id);
        $station->package_id = $package->id;

        if (!$station->store()) {
            throw new InternalServerError("could not save station");
        }

        return $this->getContentResponse($station);
    }

    public function update(ServerRequestInterface $request, ResponseInterface $response, $args)
    {
        $station_id = $args['id'] ?? null;

        if ($station_id === null) {
            throw new RecordNotFoundException();
        }

        $station = StationAuthority::findOneFiltered($station_id, $this->getUser($request), PermissionHelper::getMasters('dozent'));

        if (!$station) {
            throw new RecordNotFoundException();
        }

        $validated = $this->validate($request);

        $data = new JsonApiDataHelper($validated);

        if ($title = $data->getAttribute('title')) {
            $station->title = $title;
        }

        if ($slug = $data->getAttribute('slug')) {
            $station->slug = $slug;
        }

        $sort = $data->getAttribute('sort');
        if ($sort !== null) {
            $station->sort = $sort;
        }

        if ($station->isDirty() && !$station->store()) {
            throw new InternalServerError("could not update package");
        }

        return $this->getContentResponse($station);
    }

    public function delete(ServerRequestInterface $request, ResponseInterface $response, $args)
    {
        $station_id = $args['station_id'] ?? null;

        if (!$station_id) {
            throw new RecordNotFoundException();
        }

        $station = StationAuthority::findOneFiltered($station_id, $this->getUser($request), PermissionHelper::getMasters('dozent'));

        if (!$station->delete()) {
            throw new InternalServerError("could not delete entity");
        }

        return $response->withStatus(204);
    }

    /**
     * @inheritDoc
     */
    protected function buildResourceValidationRules(Validator $validator, $new = false): Validator
    {
        $validator
            ->rule('required', 'data.attributes.title')
            ->rule('required', 'data.attributes.slug')
            ->rule('numeric', 'data.attributes.sort');

        if ($new) {
            $validator
                ->rule('required', 'data.relationships.package.data.id');
        }

        return $validator;
    }
}
