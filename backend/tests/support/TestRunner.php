<?php
declare(strict_types=1);

final class TestRunner
{
    /** @var array<int, array{string, callable}> */
    private array $tests = [];

    public function add(string $name, callable $callback): void
    {
        $this->tests[] = [$name, $callback];
    }

    public function run(): int
    {
        $failures = 0;

        foreach ($this->tests as [$name, $callback]) {
            try {
                $callback();
                $this->write("[PASS] {$name}");
            } catch (AssertionFailed $assertionFailed) {
                $failures++;
                $this->write("[FAIL] {$name} - {$assertionFailed->getMessage()}");
            } catch (Throwable $throwable) {
                $failures++;
                $this->write("[ERROR] {$name} - {$throwable->getMessage()}");
            }
        }

        $summary = sprintf(
            "Executed %d test%s with %d failure%s.",
            count($this->tests),
            count($this->tests) === 1 ? '' : 's',
            $failures,
            $failures === 1 ? '' : 's'
        );
        $this->write($summary);

        return $failures === 0 ? 0 : 1;
    }

    private function write(string $message): void
    {
        fwrite(STDOUT, $message . PHP_EOL);
    }
}
