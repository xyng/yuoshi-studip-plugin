<?php
declare(strict_types=1);

namespace Xyng\Yuoshi\ContentSolutionValidators;


use Xyng\Yuoshi\Model\Tasks;

class ContentSolutionValidatorService {
    public static function getValidator(Tasks $task): ?ContentSolutionValidator {
        // TODO: do something!

        switch ($task->kind) {
            case "cloze":
                return new ClozeSolutionValidator();
        }

        return null;
    }
}
