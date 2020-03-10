<?php
namespace Xyng\Yuoshi\Api\Exception;

use Valitron\Validator;

class ValidationException extends \JsonApi\Errors\UnprocessableEntityException
{
    public function __construct(Validator $validator, array $source = null)
    {
        $errors = array_values($validator->errors());

        parent::__construct($errors[0][0] ?? 'unexpected validation error', $source);
    }
}
