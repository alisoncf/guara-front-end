/*
SQL Error [23505]: ERRO: duplicar valor da chave viola a restrição de unicidade "pessoas_email_uindex" 
  Detail: Chave (email)=(karla.angelica@ueg.br) já existe.
  Where: comando SQL "update eventos.pessoas set email = new.email,fk_pessoa_fisica=new.id where cpf = new.cpf" 
função PL/pgSQL ueg.trg_iguala_email() linha 19 em comando SQL
*/
update ueg.pessoas_fisicas set email_alt = email, email = 'karla.angelica@ueg.br' where id = '2847'; 
