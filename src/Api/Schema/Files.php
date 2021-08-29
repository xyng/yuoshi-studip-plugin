<?php
namespace Xyng\Yuoshi\Api\Schema;

use JsonApi\Schemas\SchemaProvider;
use Neomerx\JsonApi\Document\Link;
use Xyng\Yuoshi\Model\Files as FilesModel;

class Files extends SchemaProvider
{
    const TYPE = 'files';
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
     *
     * @param FilesModel $resource
     */
    public function getAttributes($resource)
    {
        return [
            'file' => $resource->file,
        ];
    }

    public function getRelationships($resource, $isPrimary, array $includeList)
    {
        return [
            'file' => [
                self::DATA => $resource->file,
                self::LINKS => [
                    Link::RELATED => $this->getRelationshipRelatedLink($resource, 'file'),
                ],
            ]
        ];
    }
}
