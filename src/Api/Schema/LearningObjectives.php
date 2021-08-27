<?php
namespace Xyng\Yuoshi\Api\Schema;

use JsonApi\Schemas\SchemaProvider;
use Neomerx\JsonApi\Document\Link;
use Psr\Http\Message\ServerRequestInterface;
use User;

class LearningObjectives extends SchemaProvider
{
    const TYPE = 'learning_objectives';
    protected $resourceType = self::TYPE;

    /**
     * @inheritDoc
     */
    public function getId($resource)
    {
        // we'll have duplicate ids when user_id is included
        // this will circumvent that (maybe not the best way though)
        if ($resource->isAdditionalField('user_id')) {
            return $resource->getId($resource) . '_' . $resource->user_id;
        }

        return $resource->getId($resource);
    }

    /**
     * @inheritDoc
     */
    public function getAttributes($resource)
    {
        return [
            'package_id' => $resource->package_id,
            'title' => $resource->title,
            'description' => $resource->description,
            'sort' => (int) $resource->sort,
            'mkdate' => $resource->mkdate->format('c'),
            'chdate' => $resource->chdate->format('c'),
        ];
    }

    /**
     * @param \Xyng\Yuoshi\Model\LearningObjectives $resource
     * @param bool $isPrimary
     * @param array $includeRelationships
     * @return array[]
     */
    public function getRelationships($resource, $isPrimary, array $includeRelationships)
    {
        $images = null;
        if ($includeRelationships['images'] ?? null) {
            $images = $resource->images;
        }

        return [
            'images' => [
                self::DATA => $images,
                self::SHOW_SELF => true,
//                self::LINKS => [
//                    Link::RELATED => $this->getRelationshipRelatedLink($resource, 'images')
//                ],
            ],
        ];
    }
}
