<?php
namespace Xyng\Yuoshi\Api\Authority;

use User;
use Xyng\Yuoshi\Model\Packages;

class PackageAuthority
{
    public static function canEditPackage(User $user, Packages $package) {
        return $GLOBALS['perm']->have_studip_perm('dozent', $package->course_id, $user->id);
    }

    public static function canSeePackage(User $user, Packages $package) {
        return $GLOBALS['perm']->have_studip_perm('user', $package->course_id, $user->id);
    }
}
