<?php
namespace Xyng\Yuoshi\Api\Helper;

use Valitron\Validator;

trait ValidationTrait
{
    use \JsonApi\Routes\ValidationTrait;

    /**
     * @param Validator $validator Validator to be hydrated with rules
     * @param mixed $data Data that was passed into `validate` method.
     * @return Validator
     */
    protected abstract function buildResourceValidationRules(Validator $validator, $data): Validator;

    /**
     * @inheritDoc
     */
    protected function validateResourceDocument($json, $data)
    {
        $validator = $this->buildResourceValidationRules(new Validator($json), $data);


        if ($validator->validate()) {
            return null;
        }

        $errors = $validator->errors();

        // return first error message
        return array_shift(array_shift($errors));
    }
}
