<?php
declare(strict_types=1);

namespace Xyng\Yuoshi\ContentSolutionValidators;

use Xyng\Yuoshi\Model\UserTaskContentSolutions;

interface ContentSolutionValidator {
    /**
     * Validate given Task, return points as int
     * @param UserTaskContentSolutions $contentSolution
     * @return int
     */
    public function validate(UserTaskContentSolutions $contentSolution): int;
}
