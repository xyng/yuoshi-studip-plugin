<?php
namespace Xyng\Yuoshi\Helper;

use InvalidArgumentException;
use JsonApi\Errors\AuthorizationFailedException;
use Seminar_Perm;

class PermissionHelper
{
    public static function getSlaves(string $perm, bool $includeSelf = true)
    {
        $perms = static::getPerm()->permissions;
        $score = $perms[$perm] ?? null;

        if (!$score) {
            throw new InvalidArgumentException("invalid permission");
        }

        return array_keys(array_filter($perms, function ($val) use ($includeSelf, $score) {
            if ($includeSelf) {
                return $val <= $score;
            } else {
                return $val < $score;
            }
        }));
    }

    public static function getMasters(string $perm, bool $includeSelf = true)
    {
        $perms = static::getPerm()->permissions;
        $score = $perms[$perm] ?? null;

        if (!$score) {
            throw new InvalidArgumentException("invalid permission");
        }

        return array_keys(array_filter($perms, function ($val) use ($includeSelf, $score) {
            if ($includeSelf) {
                return $val >= $score;
            } else {
                return $val > $score;
            }
        }));
    }

    public static function getPerm(): Seminar_Perm
    {
        return $GLOBALS['perm'];
    }

    public static function getUser(): \Seminar_User
    {
        $user = $GLOBALS['user'] ?? null;
    
        if (!$user) {
            throw new AuthorizationFailedException();
        }
        return $user;
    }
}
