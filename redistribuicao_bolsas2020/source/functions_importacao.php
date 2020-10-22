<?php

class TipoBolsa {

	const PIBIC_CNPq = 56;
	const PIBIC_AF_CNPq = 57;
	const PIBITI_CNPq = 58;
	const PBIC_EM = 59;
	const PVIT_UEG = 60;
	const PVIC_UEG = 61;
	const PBIT_UEG = 63;
	const PBIC_UEG = 62;

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

function gerarViewBolsistas2020() {
	$sql = "
			DROP MATERIALIZED VIEW public._bolsistas_2020;
			
			CREATE MATERIALIZED VIEW public._bolsistas_2020
				TABLESPACE pg_default
				AS 
				select	
					t.fk_grande_area,
					t.grande_area,
					t.ordem_relatorio_final as ordem,
					t.tipo_resultado,
					t.pontuacao_final,
					t.media_global_historico,
					t.dt_nascimento,
					t.id_bolsista,
					t.dep_nome, 
					t.titulo_projeto,
					t.id_coordenador,
					t.nome_coordenador,
					t.nome_academico,
					t.modalidade_id,
					t.modalidade,
					t.modalidade_vigente_final_exec_id,
					t.modalidade_exec_final,
					t.modalidade_vigente_final_id,
					t.modalidade_final,
					t.total_pontuacao_ueg
				from
					(
					select
						distinct pr.id as id_projeto, b.id as id_bolsista, d.dep_nome, pr.titulo_projeto, pr.fk_grande_area, ga.descricao as grande_area, 
						coord.id as id_coordenador, coord.nome as nome_coordenador, coord.email, p.nome as nome_academico, bv.id as modalidade_id, mb.sigla as modalidade,
						case
							when b.fk_tipo_resultado_final is null then pres.fk_tipo_resultado
							else b.fk_tipo_resultado_final
						end as tipo_resultado, pres.nota_lattes, pres.nota_valida_lattes,
						case
							when mb.id in (1, 2, 3)
							and mbFinal.id not in (1, 2, 3) then pres.total_pontuacao_ueg
							else pres.total_pontuacao
						end as pontuacao_final, pres.media_global_historico, edital.processo, edital.id as id_edital, edital.descricao as edital, pr.fk_pessoa_fisica, 
						pres.carater_individualizado, sp.id as id_status_projeto, sp.descricao as status_projeto, p.dt_nascimento, bvFinal.id as modalidade_vigente_final_id, 
						mbFinal.id as modalidade_final_id, mbFinal.sigla as modalidade_final, bvFinalExec.id as modalidade_vigente_final_exec_id, 
						mbFinalExec.id as modalidade_final_exec_id, mbFinalExec.sigla as modalidade_exec_final, mbFinal.ordem_relatorio as ordem_relatorio_final, 
						mb.ordem_relatorio, b.observacao_resultado, l.ueg, l.cnpq, l.voluntarios, l.bic_em, l.titulacao, pr.produtividade_cnpq, pres.total_pontuacao_ueg
					from
						athena.bolsista b
					join ueg.pessoas_fisicas p on
						b.fk_pessoa_fisica = p.id
					join athena.projeto pr on
						b.fk_projeto = pr.id
					join athena.status_projeto sp on
						sp.id = pr.fk_status_projeto
					join ueg.grandes_areas ga on
						pr.fk_grande_area = id_grande_area
					join ueg.tbl_departamentos d on
						pr.fk_tbl_departamento = d.dep_id
					join ueg.pessoas_fisicas coord on
						pr.fk_pessoa_fisica = coord.id
					join athena.modalidade_bolsa_vigente bv on
						b.fk_modalidade_bolsa_vigente = bv.id
					join athena.modalidade_bolsa mb on
						bv.fk_modalidade_bolsa = mb.id
					join athena.distribuicao_bolsa dis on
						bv.fk_distribuicao_bolsa = dis.id
					join athena.edital_bolsista edital on
						dis.fk_edital_bolsista = edital.id
					join athena.processa_resultado pres on
						pres.fk_bolsista = b.id
					join athena.modalidade_bolsa_vigente bvFinal on
						b.fk_modalidade_bolsa_vigente_final = bvFinal.id
					join athena.modalidade_bolsa mbFinal on
						bvfinal.fk_modalidade_bolsa = mbFinal.id
					left outer join athena.modalidade_bolsa_vigente bvFinalExec on
						b.fk_modalidade_bolsa_vigente_em_exec = bvFinalExec.id
					left outer join athena.modalidade_bolsa mbFinalExec on
						bvFinalExec.fk_modalidade_bolsa = mbFinalExec.id
					left outer join (	
						select
							processo, nome, cpf, titulacao, limite_ueg, limite_cnpq, limite_voluntario, ueg, cnpq, bic_em, voluntarios
						from
							athena.limites
						where
							processo ='20201'			
							) l on
						l.cpf = coord.cpf
					where
						pres.processo = '20201'
						and (b.fk_status_bolsista is null
						or b.fk_status_bolsista not in (4, 16,13))
						and edital.processo = '20201'
						and tipo = 3 -- resultado conferencia
						) as t
				order by
					t.grande_area,
					ordem,
					t.tipo_resultado,
					t.pontuacao_final desc,
					t.media_global_historico desc,
					t.dt_nascimento asc
	";
	TDG::getInstance()->genericQuery($sql);
}
