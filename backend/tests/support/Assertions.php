<?php
declare(strict_types=1);

final class AssertionFailed extends RuntimeException
{
}

function assertTrue($condition, string $message = ''): void
{
    if (!$condition) {
        throw new AssertionFailed($message ?: 'Failed asserting that condition is true.');
    }
}

function assertSame($expected, $actual, string $message = ''): void
{
    if ($expected !== $actual) {
        $export = function ($value) {
            return var_export($value, true);
        };

        $defaultMessage = sprintf(
            'Failed asserting that %s is identical to expected %s.',
            $export($actual),
            $export($expected)
        );

        throw new AssertionFailed($message ?: $defaultMessage);
    }
}

function assertEquals($expected, $actual, string $message = ''): void
{
    if ($expected != $actual) {
        $export = function ($value) {
            return var_export($value, true);
        };

        $defaultMessage = sprintf(
            'Failed asserting that %s matches expected %s.',
            $export($actual),
            $export($expected)
        );

        throw new AssertionFailed($message ?: $defaultMessage);
    }
}

function assertArrayHasKey($key, array $array, string $message = ''): void
{
    if (!array_key_exists($key, $array)) {
        $defaultMessage = sprintf('Failed asserting that array has key "%s".', (string) $key);
        throw new AssertionFailed($message ?: $defaultMessage);
    }
}

function assertNotEmpty($value, string $message = ''): void
{
    if (empty($value)) {
        throw new AssertionFailed($message ?: 'Failed asserting that value is not empty.');
    }
}

function fail(string $message): void
{
    throw new AssertionFailed($message);
}
