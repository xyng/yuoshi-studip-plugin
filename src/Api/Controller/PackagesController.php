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
use Xyng\Yuoshi\Helper\AuthorityHelper;
use Xyng\Yuoshi\Helper\PermissionHelper;
use Xyng\Yuoshi\Helper\QueryField;
use Xyng\Yuoshi\Model\Packages;

class PackagesController extends JsonApiController
{
    use ValidationTrait;

    protected $allowedFilteringParameters = ['course'];
    protected $allowedPagingParameters = ['offset', 'limit'];

    public function index(ServerRequestInterface $request, ResponseInterface $response, $args) {
        $course_id = $args['id'] ?? null;

        if (!$course_id) {
            $filters = $this->getQueryParameters()->getFilteringParameters();
            $course_id = $filters['course'] ?? null;
        }

        $solvedTaskCount = 'count(distinct concat(`yuoshi_user_task_solutions`.`task_id`, `yuoshi_user_task_solutions`.`user_id`))';

        $studentJoinConditions = [];

        $user = $this->getUser($request);
        if (!PermissionHelper::getPerm()->have_studip_perm('dozent', $course_id, $user->id)) {
            $studentJoinConditions['Students.user_id'] = $user->id;
        }

        $packages = Packages::findWithQuery(
            [
                'joins' => [
                    [
                        'sql' => PackageAuthority::getFilter(),
                        'params' => [
                            'user_id' => $user->id,
                        ]
                    ],
                    [
                        'type' => 'left',
                        'table' => 'yuoshi_tasks',
                        'on' => [
                            'yuoshi_packages.id' => new QueryField('yuoshi_tasks.package_id')
                        ]
                    ],
                    [
                        'type' => 'left',
                        'table' => 'seminar_user',
                        'alias' => 'Students',
                        'on' => [
                            'Students.Seminar_id' => new QueryField('yuoshi_packages.course_id'),
                            'Students.status IN' => PermissionHelper::getSlaves('autor'),
                        ] + $studentJoinConditions,
                    ],
                    [
                        'type' => 'left',
                        'table' => 'yuoshi_user_task_solutions',
                        'on' => [
                            'yuoshi_tasks.id' => new QueryField('yuoshi_user_task_solutions.task_id'),
                            'Students.user_id' => new QueryField('yuoshi_user_task_solutions.user_id'),
                            'yuoshi_user_task_solutions.finished is not null',
                        ]
                    ]
                ],
                'conditions' => [
                    'yuoshi_packages.course_id' => $course_id,
                ],
                'group' => [
                    'yuoshi_packages.id'
                ]
            ],
            [
                'progress' => '(' . $solvedTaskCount . '* 100) / count(`yuoshi_tasks`.`id`)',
            ]
        );

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

    public function delete(ServerRequestInterface $request, ResponseInterface $response, $args) {
        $package_id = $args['package_id'] ?? null;

        if (!$package_id) {
            throw new RecordNotFoundException();
        }

        $package = PackageAuthority::findOneFiltered($package_id, $this->getUser($request), PermissionHelper::getMasters('dozent'));

        if (!$package->delete()) {
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
            ->rule('required', 'data.attributes.slug');

        if ($new) {
            $validator
                ->rule('required', 'data.relationships.course.data.id');
        }

        return $validator;
    }
}
