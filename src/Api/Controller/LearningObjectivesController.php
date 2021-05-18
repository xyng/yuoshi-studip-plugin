<?php
namespace Xyng\Yuoshi\Api\Controller;

use Course;
use InvalidArgumentException;
use JsonApi\Errors\AuthorizationFailedException;
use JsonApi\Errors\InternalServerError;
use JsonApi\Errors\RecordNotFoundException;
use JsonApi\Errors\UnprocessableEntityException;
use JsonApi\JsonApiController;
use JsonApi\Routes\Courses\Authority as CourseAuthority;
use Psr\Http\Message\RequestInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use User;
use Valitron\Validator;

class LearningObjectivesController extends JsonApiController
{
    use ValidationTrait;

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
        $learning_objectives = LearningObjectivesAuthority::findFiltered([$package_id], $this->getUser($request));
        list($offset, $limit) = $this->getOffsetAndLimit();

        return $this->getPaginatedContentResponse(
            array_slice($learning_objectives, $offset, $limit),
            count($learning_objectives)
        );
    }
    // TODO show für UI findOneFiltered
}
