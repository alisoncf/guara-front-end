<?php

class TipoBolsa {

	const PIBIC_CNPq = 56;
	const PIBIC_AF_CNPq = 57;
	const PIBITI_CNPq = 58;
	const PBIC_EM = 59;
	const PVIT_UEG = 60;
	const PVIC_UEG = 61;
	const PBIT_UEG = 62;
	const PBIC_UEG = 63;

}

function getOrientadoresSemAjudaCusta($bolsistas2020): array {
	$orientadores = [];
	$orientadoresFinal = [];
	for ($index = 0; $index < count($bolsistas2020); $index++) {
		$bolsista = $bolsistas2020[$index];
		$orientadores[$bolsista['id_coordenador']]['count'] = ($orientadores[$bolsista['id_coordenador']]['count'] ?? 0) + 1;
		$orientadores[$bolsista['id_coordenador']]['bolsa'][] = $bolsista['modalidade_vigente_final_exec_id'];
		if(!isset($orientadores[$bolsista['id_coordenador']]['remocao'])){
			$orientadores[$bolsista['id_coordenador']]['remocao'] = false;
		}
		if (!$orientadores[$bolsista['id_coordenador']]['remocao'] && in_array($bolsista['modalidade_vigente_final_exec_id'], [TipoBolsa::PIBIC_AF_CNPq, TipoBolsa::PIBIC_CNPq, TipoBolsa::PIBITI_CNPq])) {
			$orientadores[$bolsista['id_coordenador']]['remocao'] = true;
		}
	}
	foreach ($orientadores as $key => $value) {
		if($value['remocao']) {
			continue;
		}
		$orientadoresFinal[] = $key;
	}
	return $orientadoresFinal;
}
