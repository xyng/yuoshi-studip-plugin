<?php
namespace Xyng\Yuoshi\Api\Controller;

use Course;
use JsonApi\Errors\AuthorizationFailedException;
use JsonApi\Errors\InternalServerError;
use JsonApi\Errors\RecordNotFoundException;
use JsonApi\JsonApiController;
use JsonApi\Routes\Courses\Authority as CourseAuthority;
use JsonApi\Routes\ValidationTrait;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;

use Valitron\Validator;
use Xyng\Yuoshi\Api\Helper\JsonApiDataHelper;
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

        foreach ($course_ids as $course_id) {
            /** @var Course|null $course */
            $course = Course::find($course_id);

            if ($course == null) {
                throw new RecordNotFoundException();
            }

            if (!CourseAuthority::canShowCourse($this->getUser($request), $course, CourseAuthority::SCOPE_BASIC)) {
                throw new AuthorizationFailedException();
            }
        }

        if ($course_ids) {
            $packages = Packages::findWhere([
                'course_id IN' => $course_ids,
                'course_id IS NOT NULL'
            ]);
        } else {
            $packages = [];
        }

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
        $attributes = $data->getAttributes(['title', 'slug', 'course_id']);

        if (!$attributes['course_id']) {
            throw new RecordNotFoundException();
        }

        /** @var Course|null $course */
        $course = Course::find($attributes['course_id']);

        if ($course == null) {
            throw new RecordNotFoundException();
        }

        if (!CourseAuthority::canEditCourse($this->getUser($request), $course, CourseAuthority::SCOPE_BASIC)) {
            throw new AuthorizationFailedException();
        }

        $package = Packages::build($attributes);

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

        $package = Packages::find($package_id);

        if (!$package) {
            throw new RecordNotFoundException();
        }

        $course = $package->course;

        if (!CourseAuthority::canEditCourse($this->getUser($request), $course, CourseAuthority::SCOPE_BASIC)) {
            throw new AuthorizationFailedException();
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
    protected function validateResourceDocument($json, $new = false)
    {
        $validator = new Validator($json);
        $validator
            ->rule('required', 'data.attributes.title')
            ->rule('required', 'data.attributes.slug');

        if ($new) {
            $validator
                ->rule('required', 'data.attributes.course_id');
        }

        $errors = $validator->errors();
        if (!$errors) {
            return null;
        }

        // return first error message
        return array_shift(array_shift($errors));
    }
}
