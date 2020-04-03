<?php
namespace Xyng\Yuoshi\Schema;

use JsonApi\Schemas\SchemaProvider;
use Neomerx\JsonApi\Document\Link;

class TaskContentSolutions extends SchemaProvider {
    const TYPE = 'task_content_solutions';
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
        /** @var \Xyng\Yuoshi\Model\UserTaskContentSolutions $resource */
        return [
            'value' => $resource->value ? $resource->value->getArrayCopy() : null,
            'mkdate' => $resource->mkdate->format('c'),
            'chdate' => $resource->chdate->format('c'),
        ];
    }

    public function getRelationships($resource, $isPrimary, array $includeRelationships)
    {
        /** @var \Xyng\Yuoshi\Model\UserTaskContentSolutions $resource */
        $task_solution = null;
        if ($includeRelationships['task_solution'] ?? null) {
            $task_solution = $resource->task_solution;
        }

        $content = null;
        if ($includeRelationships['content'] ?? null) {
            $content = $resource->content;
        }

        $quest_solutions = null;
        if ($includeRelationships['quest_solutions'] ?? null) {
            $quest_solutions = $resource->quest_solutions;
        }

        return [
            'task_solution' => [
                self::DATA => $task_solution,
                self::SHOW_SELF => true,
                self::LINKS => [
                    Link::RELATED => $this->getRelationshipRelatedLink($resource, 'task_solution')
                ],
            ],
            'content' => [
                self::DATA => $content,
                self::SHOW_SELF => true,
                self::LINKS => [
                    Link::RELATED => $this->getRelationshipRelatedLink($resource, 'content')
                ],
            ],
            'quest_solutions' => [
                self::DATA => $quest_solutions,
                self::SHOW_SELF => true,
                self::LINKS => [
                    Link::RELATED => $this->getRelationshipRelatedLink($resource, 'quest_solutions')
                ],
            ],
        ];
    }
}
