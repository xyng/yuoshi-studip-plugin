<?php
namespace Xyng\Yuoshi\Api\Controller;

use Course;
use JsonApi\Errors\AuthorizationFailedException;
use JsonApi\Errors\InternalServerError;
use JsonApi\Errors\RecordNotFoundException;
use JsonApi\JsonApiController;
use JsonApi\Routes\Courses\Authority as CourseAuthority;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;

use Valitron\Validator;
use Xyng\Yuoshi\Api\Authority\PackageAuthority;
use Xyng\Yuoshi\Api\Helper\JsonApiDataHelper;
use Xyng\Yuoshi\Api\Helper\ValidationTrait;
use Xyng\Yuoshi\Helper\PermissionHelper;
use Xyng\Yuoshi\Model\Packages;

class PackagesController extends JsonApiController
{
    use ValidationTrait;

    protected $allowedFilteringParameters = ['course'];
    protected $allowedPagingParameters = ['offset', 'limit'];

    public function index(ServerRequestInterface $request, ResponseInterface $response, $args) {
        $course_id = $args['id'] ?? null;

        $course_ids = $course_id ? [$course_id] : [];

        if (!$course_ids) {
            $filters = $this->getQueryParameters()->getFilteringParameters();
            $course_ids = explode(',', $filters['course'] ?? '');
        }

        $packages = PackageAuthority::findFiltered($course_ids, $this->getUser($request));

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

    public function create(ServerRequestInterface $request, ResponseInterface $response, $args) {
        $validated = $this->validate($request, true);
        $data = new JsonApiDataHelper($validated);
        $attributes = $data->getAttributes(['title', 'slug']);

        /** @var Course|null $course */
        $course = Course::find($data->getRelation('course')['data']['id'] ?? null);

        if ($course == null) {
            throw new RecordNotFoundException();
        }

        if (!CourseAuthority::canEditCourse($this->getUser($request), $course, CourseAuthority::SCOPE_BASIC)) {
            throw new AuthorizationFailedException();
        }

        $package = Packages::build($attributes);
        $package->course_id = $course->id;

        if (!$package->store()) {
            throw new InternalServerError("could not save package");
        }

        return $this->getContentResponse($package);
    }

    public function update(ServerRequestInterface $request, ResponseInterface $response, $args) {
        $package_id = $args['id'] ?? null;

        if ($package_id === null) {
            throw new RecordNotFoundException();
        }

        $package = PackageAuthority::findOneFiltered($package_id, $this->getUser($request), PermissionHelper::getMasters('dozent'));

        if (!$package) {
            throw new RecordNotFoundException();
        }

        $validated = $this->validate($request);

        $data = new JsonApiDataHelper($validated);

        if ($title = $data->getAttribute('title')) {
            $package->title = $title;
        }

        if ($slug = $data->getAttribute('slug')) {
            $package->slug = $slug;
        }

        if ($package->isDirty() && !$package->store()) {
            throw new InternalServerError("could not update package");
        }

        return $this->getContentResponse($package);
    }


    /**
     * @inheritDoc
     */
    protected function buildResourceValidationRules(Validator $validator, $new = false): Validator
    {
        $validator
            ->rule('required', 'data.attributes.title')
            ->rule('required', 'data.attributes.slug');

        if ($new) {
            $validator
                ->rule('required', 'data.relationships.course.data.id');
        }

        return $validator;
    }
}
