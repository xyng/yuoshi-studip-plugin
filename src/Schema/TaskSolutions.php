<?php
namespace Xyng\Yuoshi\Schema;

use JsonApi\Schemas\SchemaProvider;
use Neomerx\JsonApi\Document\Link;

class TaskSolutions extends SchemaProvider {
    const TYPE = 'task_solutions';
    protected $resourceType = self::TYPE;

    /**
     * @inheritDoc
     */
    public function getId($resource)
    {
        return $resource->getId($resource);
    }

    /**
     * @inheritDoc
     */
    public function getAttributes($resource)
    {
        /** @var \Xyng\Yuoshi\Model\UserTaskSolutions $resource */
        return [
            'points' => (int) $resource->points,
            'is_correct' => (bool) $resource->is_correct,
            'mkdate' => $resource->mkdate->format('c'),
            'chdate' => $resource->chdate->format('c'),
        ];
    }

    public function getRelationships($resource, $isPrimary, array $includeRelationships)
    {
        /** @var \Xyng\Yuoshi\Model\UserTaskSolutions $resource */
        $task = null;
        if ($includeRelationships['task'] ?? null) {
            $task = $resource->task;
        }

        $content_solutions = null;
        if ($includeRelationships['content_solutions'] ?? null) {
            $content_solutions = $resource->content_solutions;
        }

        $user = null;
        if ($includeRelationships['user'] ?? null) {
            $user = $resource->user;
        }

        return [
            'task' => [
                self::DATA => $task,
                self::SHOW_SELF => true,
                self::LINKS => [
                    Link::RELATED => $this->getRelationshipRelatedLink($resource, 'task')
                ],
            ],
            'content_solutions' => [
                self::DATA => $content_solutions,
                self::SHOW_SELF => true,
                self::LINKS => [
                    Link::RELATED => $this->getRelationshipRelatedLink($resource, 'content_solutions')
                ],
            ],
            'user' => [
                self::DATA => $user,
                self::SHOW_SELF => true,
                self::LINKS => [
                    Link::RELATED => $this->getRelationshipRelatedLink($resource, 'user')
                ],
            ],
        ];
    }
}
