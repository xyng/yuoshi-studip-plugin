<?php
declare(strict_types=1);

namespace Xyng\Yuoshi\ContentSolutionValidators;

use Xyng\Yuoshi\Model\TaskContents;
use Xyng\Yuoshi\Model\UserTaskContentSolutions;

class ClozeSolutionValidator implements ContentSolutionValidator {
    protected function getInputs(TaskContents $content): array {
        $matches = [];
        $success = preg_match_all('/##((?!##)*).+##/', $content->content, $matches);

        if ($success === false) {
            return [];
        }

        return array_filter(
            array_map(
                function (string $match) {
                    return str_replace('##', '', $match);
                },
                array_flatten($matches)
            )
        );
    }

    public function validate(UserTaskContentSolutions $contentSolution): float {
        // TODO: parse content of task and solution, compare inputs and values, give 1 point per correct value.

        $inputs = $this->getInputs($contentSolution->content);

        $correctInputs = 0;
        foreach ($inputs as $key => $correctValue) {
            /** @var string|null $userInput */
            $userInput = $contentSolution->value['input-' . $key] ?? null;

            if ($correctValue == $userInput) {
                $correctInputs += 1;
            }
        }

        return $correctInputs / max(count($inputs), 1);
    }
}
