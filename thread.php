#!/usr/bin/php
<?php

class WorkerThread extends Thread {

	public function __construct($i) {
		$this->i = $i;
	}

	public function run() {
		while (true) {
			echo $this->i;
			sleep(1);
		}
	}

	public function isGarbage(): bool {
		
	}

	public function offsetExists($offset): bool {
		
	}

	public function offsetGet($offset) {
		
	}

	public function offsetSet($offset, $value): void {
		
	}

	public function offsetUnset($offset): void {
		
	}

	public function setGarbage(): void {
		
	}

}

for ($i = 0; $i < 10; $i++) {
	$workers[$i] = new workerThread($i);
	$workers[$i]->start();
}
