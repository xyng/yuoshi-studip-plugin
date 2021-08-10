<?php
declare(strict_types=1);

namespace Xyng\Yuoshi\ContentSolutionValidators;

use Xyng\Yuoshi\Model\UserTaskContentSolutions;

class ClozeSolutionValidator implements ContentSolutionValidator {
    public function validate(UserTaskContentSolutions $contentSolution): int {
        // TODO: parse content of task and solution, compare inputs and values, give 1 point per correct value.
        return 0;
    }
}
