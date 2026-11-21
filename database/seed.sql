-- Dados mínimos do site, tirados de frontend/data/*.json
-- Rode depois de database/schema.sql. Pode rodar de novo: apaga e reinsere.
begin;
truncate table
  contatos, admins, portfolio, portfolio_categorias, faq,
  cursos, servicos_detalhe, servicos_avulsos, combos, studio
restart identity;

insert into studio (
  id, nome, assinatura, cidade, mensagem_central, posicionamento, marca_frase, rodape_frase,
  whatsapp_numero, whatsapp_link_curto, telefone_exibicao, telefone_href,
  instagram, instagram_handle, threads, email, endereco, horario,
  seo_titulo, seo_descricao, url_canonica,
  mensagem_geral, mensagem_combo, mensagem_servico, mensagem_referencias,
  mensagem_curso, mensagem_quinta, mensagem_proxima, sinal, regra_sinal, extra
) values (
  1, 'Hellen Varella', 'Studio de beleza e fotografia', 'Fraiburgo, SC', 'Você vai ter dó de tirar a maquiagem.',
  'Para quem precisa de dar um Up na autoestima, a Hellen Varella é um Studio de beleza e fotografia que proporciona uma experiência completa de cuidado, fazendo cada cliente se sentir bonita, confiante e digna de ser lembrada.', 'A Hellen Varella é uma marca que transforma momentos comuns em memórias especiais.', 'Beleza que vira lembrança.',
  '5549998293732', 'https://wa.me/message/RAVKCLUTZ6AGG1', '(49) 99829-3732', 'tel:+5549998293732',
  'https://www.instagram.com/hellenvarella.makeup/', '@hellenvarella.makeup', 'https://www.threads.net/@hellenvarella.makeup', null, null, null,
  'Hellen Varella · Studio de beleza e fotografia · Fraiburgo, SC', 'Maquiagem, cabelo e fotografia no mesmo lugar. Você sai pronta e guarda o momento em imagens. Studio Hellen Varella, Fraiburgo/SC.', null,
  'Oi, Hellen! Vi o site e quero agendar meu horário.', 'Oi, Hellen! Vi o site e quero o {combo}. Cidade: Fraiburgo. Data que penso: __ / Ocasião: __', 'Oi, Hellen! Quero agendar {servico}.', 'Oi, Hellen! Quero enviar referências de roupa e make antes do ensaio.',
  'Oi, Hellen! Quero saber da próxima turma do {servico}.', 'Oi, Hellen! A Quinta Especial ainda está disponível?', 'Oi, Hellen! Quero ser a próxima.', 'R$ 30', 'Reagendar em até 60 dias com o mesmo sinal.',
  'Aniversário: mini bolo da mãe (massa e decoração) por R$ 35 — avisar com antecedência.'
);

insert into combos (id, kicker, titulo, preco, preco_valor, itens, destaque, ordem) values ('combo-1', 'Combo 1', 'Maquiagem + ensaio', 'R$ 300', 300, '["Maquiagem profissional","30 fotos digitais editadas","Até cerca de 2h30","Entrega em até 7 dias úteis"]'::jsonb, false, 1);
insert into combos (id, kicker, titulo, preco, preco_valor, itens, destaque, ordem) values ('combo-2', 'Combo 2', 'Maquiagem + cabelo + ensaio', 'R$ 370', 370, '["Maquiagem profissional","Cabelo: lavagem, escova e babyliss/cachos","45 fotos digitais editadas","Até cerca de 3h30","Entrega em até 7 dias úteis"]'::jsonb, true, 2);
insert into combos (id, kicker, titulo, preco, preco_valor, itens, destaque, ordem) values ('combo-3', 'Combo 3', 'Produção completa + ensaio', 'R$ 420', 420, '["Maquiagem profissional","Cabelo completo","50 fotos digitais editadas","Ajuda na escolha do look","Cerca de 4 a 5 horas","Entrega em até 7 dias úteis"]'::jsonb, false, 3);
insert into combos (id, kicker, titulo, preco, preco_valor, itens, destaque, ordem) values ('combo-4', 'Combo 4', 'Só ensaio fotográfico', 'R$ 260', 260, '["30 fotos digitais editadas","Não inclui maquiagem nem cabelo","Entrega em até 7 dias úteis"]'::jsonb, false, 4);

insert into servicos_avulsos (id, kicker, titulo, preco, preco_sufixo, itens, aviso, soft, ordem) values ('corte-feminino', 'Cabelo', 'Corte feminino', 'R$ 60', 'com escova', '["Camadas leves / caimento natural","Movimento e leveza","Acabamento impecável"]'::jsonb, 'Não trabalho com cortes curtos.', false, 1);
insert into servicos_avulsos (id, kicker, titulo, preco, preco_sufixo, itens, aviso, soft, ordem) values ('quinta-especial', 'Promoção do grid', 'Quinta Especial', 'R$ 150', null, '["Maquiagem profissional + ensaio","10 fotos editadas","Atendimento personalizado"]'::jsonb, 'Consulte no WhatsApp se a quinta ainda está disponível.', true, 2);

insert into servicos_detalhe (id, titulo, texto, aviso, cta, ordem) values ('maquiagem', 'Maquiagem', 'Social, noiva (Brilho do Sim), madura, gestante e artística. Make que parece pele, não máscara.', null, 'Quero agendar maquiagem.', 1);
insert into servicos_detalhe (id, titulo, texto, aviso, cta, ordem) values ('cabelo', 'Cabelo', 'Corte feminino com camadas leves, progressiva orgânica, escova e ondas.', 'Não trabalho com cortes curtos.', 'Quero agendar cabelo (corte não é curto).', 2);
insert into servicos_detalhe (id, titulo, texto, aviso, cta, ordem) values ('fotografia', 'Fotografia', 'Ensaio, making of, gestante e aniversário — com orientação para se sentir à vontade diante da câmera, mesmo com vergonha ou sem costume.', null, 'Quero agendar ensaio fotográfico.', 3);

insert into cursos (id, titulo, texto, cta, ordem) values ('curso-pro', 'Curso Pro', 'Formação para quem trabalha com maquiagem. Turma e valor combinamos no WhatsApp.', 'Curso Pro', 1);
insert into cursos (id, titulo, texto, cta, ordem) values ('curso-automake', 'Curso automake', 'Para você se maquiar no dia a dia e em ocasiões. Próxima turma no WhatsApp.', 'Curso automake', 2);

insert into faq (pergunta, resposta, confirmado, ordem) values ('Maquiagem, cabelo e foto são no mesmo dia?', 'Sim. É o diferencial do studio: você faz tudo num atendimento só, sai pronta e já sai com o ensaio feito. Não precisa procurar cada profissional separado.', true, 1);
insert into faq (pergunta, resposta, confirmado, ordem) values ('Tenho vergonha de foto e nunca me maquiei. Serve pra mim?', 'Serve — é pra isso que a experiência existe. A Hellen acolhe tanto quem se produz todo dia quanto quem nunca passou um batom, e orienta pose a pose para você se sentir à vontade diante da câmera.', true, 2);
insert into faq (pergunta, resposta, confirmado, ordem) values ('Como reservo a data?', 'A conversa começa no WhatsApp. A reserva é confirmada com um sinal de R$ 30, que pode ser remarcado em até 60 dias com o mesmo valor.', true, 3);
insert into faq (pergunta, resposta, confirmado, ordem) values ('Quando recebo as fotos?', 'A seleção e edição são entregues em até 7 dias úteis, em álbum no celular, com uma rodada de ajuste.', true, 4);
insert into faq (pergunta, resposta, confirmado, ordem) values ('Vocês fazem corte curto?', 'Não. O corte feminino é com camadas leves e caimento natural — cortes curtos não entram no atendimento.', true, 5);
insert into faq (pergunta, resposta, confirmado, ordem) values ('Atende em outras cidades?', '[CONFIRMAR: atende só em Fraiburgo/SC, atende região, ou vai até a cliente? — _placeholder]', false, 6);
insert into faq (pergunta, resposta, confirmado, ordem) values ('Formas de pagamento?', '[CONFIRMAR formas de pagamento aceitas — _placeholder]', false, 7);

insert into portfolio_categorias (id, rotulo, ordem) values ('todos', 'Todos', 1);
insert into portfolio_categorias (id, rotulo, ordem) values ('social', 'Social', 2);
insert into portfolio_categorias (id, rotulo, ordem) values ('noiva', 'Noiva', 3);
insert into portfolio_categorias (id, rotulo, ordem) values ('gestante', 'Gestante', 4);
insert into portfolio_categorias (id, rotulo, ordem) values ('cabelo', 'Cabelo', 5);
insert into portfolio_categorias (id, rotulo, ordem) values ('making', 'Making of', 6);
insert into portfolio_categorias (id, rotulo, ordem) values ('artistico', 'Artístico', 7);
insert into portfolio_categorias (id, rotulo, ordem) values ('antes-depois', 'Antes e depois', 8);

insert into portfolio (id, categoria, kicker, titulo, texto, formato, ordem, visivel) values ('brilho-do-sim', 'noiva', 'Noiva', 'Brilho do <em>Sim</em>', 'Pele luminosa, renda, o sim guardado em imagem. Cada detalhe conta uma história.', 'wide', 1, true);
insert into portfolio (id, categoria, kicker, titulo, texto, formato, ordem, visivel) values ('corpo-tempo-luz', 'gestante', 'Gestante', 'Corpo, tempo, <em>luz</em>', 'Ensaio para se sentir incrível agora — e guardar esse momento.', 'normal', 2, true);
insert into portfolio (id, categoria, kicker, titulo, texto, formato, ordem, visivel) values ('a-melhor-versao', 'social', 'Social', 'A melhor versão', 'Glam, madura, aniversário. Make que parece pele, não máscara.', 'normal', 3, true);
insert into portfolio (id, categoria, kicker, titulo, texto, formato, ordem, visivel) values ('camadas-leves', 'cabelo', 'Cabelo', 'Camadas <em>leves</em>', 'Caimento natural, movimento, acabamento. Sem cortes curtos.', 'normal', 4, true);
insert into portfolio (id, categoria, kicker, titulo, texto, formato, ordem, visivel) values ('o-antes-da-foto', 'making', 'Making of', 'O antes da foto', 'Bastidores de aniversário, produção e o caminho até o clique.', 'normal', 5, true);
insert into portfolio (id, categoria, kicker, titulo, texto, formato, ordem, visivel) values ('o-outro-lado', 'artistico', 'Artístico', 'O outro <em>lado</em>', 'Mood, editorial, fantasia. O olhar artístico — o recorte mais ousado, sem ser o tom do site inteiro.', 'dark', 6, true);

commit;
