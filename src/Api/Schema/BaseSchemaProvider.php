<?php
namespace Xyng\Yuoshi\Api\Schema;

use JsonApi\Schemas\SchemaProvider;
use Xyng\Yuoshi\Model\BaseModel;

abstract class BaseSchemaProvider extends SchemaProvider {
    /**
     * @inheritDoc
     *
     * @param BaseModel $resource
     */
    public function getId($resource)
    {
        return $resource->getId();
    }
}
