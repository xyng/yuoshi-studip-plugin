<?php
namespace Xyng\Yuoshi\Api\Controller;

use Course;
use JsonApi\Errors\AuthorizationFailedException;
use JsonApi\Errors\InternalServerError;
use JsonApi\Errors\RecordNotFoundException;
use JsonApi\Errors\UnprocessableEntityException;
use JsonApi\JsonApiController;
use JsonApi\Routes\any;
use JsonApi\Routes\Courses\Authority as CourseAuthority;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;

use Valitron\Validator;
use Xyng\Yuoshi\Api\Exception\ValidationException;
use Xyng\Yuoshi\Model\Packages;

class PackagesController extends JsonApiController
{
    public function index(ServerRequestInterface $request, ResponseInterface $response, $args) {
        ['id' => $course_id] = $args;
        /** @var Course|null $course */
        $course = Course::find($course_id);

        if ($course == null) {
            throw new RecordNotFoundException();
        }
        if (!CourseAuthority::canShowCourse($this->getUser($request), $course, CourseAuthority::SCOPE_BASIC)) {
            throw new AuthorizationFailedException();
        }

        $packages = Packages::findByCourse_id($course_id);

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
        ['id' => $course_id] = $args;
        /** @var Course|null $course */
        $course = Course::find($course_id);

        if ($course == null) {
            throw new RecordNotFoundException();
        }

        if (!CourseAuthority::canEditCourse($this->getUser($request), $course, CourseAuthority::SCOPE_BASIC)) {
            throw new AuthorizationFailedException();
        }

        $data = $request->getParsedBody();

        $validator = new Validator($data);
        $validator->rule('required', 'title');

        if (!$validator->validate()) {
            throw new ValidationException($validator);
        }

        $package = Packages::build([
            'title' => $data['title'],
            'course_id' => $course_id,
        ]);

        if (!$package->store()) {
            throw new InternalServerError("could not persist entity");
        }

        return $this->getContentResponse($package);
    }
}
