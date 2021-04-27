<?php
namespace Xyng\Yuoshi\Api\Schema;

use JsonApi\Schemas\SchemaProvider;
use Neomerx\JsonApi\Document\Link;

class TaskContentQuestSolutionAnswers extends SchemaProvider {
    const TYPE = 'task_content_solution_answers';
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
        /** @var \Xyng\Yuoshi\Model\UserTaskContentQuestSolutionAnswers $resource */
        return [
            'answer_id' => $resource->answer_id,
            'sort' => (int) $resource->sort,
            'custom' => $resource->custom,
            'mkdate' => $resource->mkdate->format('c'),
            'chdate' => $resource->chdate->format('c'),
        ];
    }

    public function getRelationships($resource, $isPrimary, array $includeRelationships)
    {
        /** @var \Xyng\Yuoshi\Model\UserTaskContentQuestSolutions $resource */
        $quest_solution = null;
        if ($includeRelationships['quest_solution'] ?? null) {
            $quest_solution = $resource->quest_solution;
        }
        $answer = null;
        if ($includeRelationships['answer'] ?? null) {
            $answer = $resource->answer;
        }

        return [
            'quest_solution' => [
                self::DATA => $quest_solution,
                self::SHOW_SELF => true,
                self::LINKS => [
                    Link::RELATED => $this->getRelationshipRelatedLink($resource, 'quest_solution')
                ],
            ],
            'answer' => [
                self::DATA => $answer,
                self::SHOW_SELF => true,
                self::LINKS => [
                    Link::RELATED => $this->getRelationshipRelatedLink($resource, 'answer')
                ],
            ],
        ];
    }
}
