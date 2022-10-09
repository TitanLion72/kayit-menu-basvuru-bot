const { Client, EmbedBuilder, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, ModalBuilder, TextInputBuilder } = require("discord.js");
const client = (global.client = new Client({ intents: [32767, "MessageContent"]}))
const config = require("./config.json")
const db = require("orio.db")

client.on("ready", () => {
    client.user.setStatus("dnd") // dnd: rahatsız etmeyin, idle: boşta, offline: çevrimdışı, online: çevrimiçi
    client.user.setActivity(config.botDurum)
})

client.on("messageCreate", (msg) => {
    const args = msg.content.split(" ")
    const command = args.shift()
    let cmd = args[0]

    if (command === "!kayıtbuton") {
        if (!msg.member.permissions.has("Administrator")) return msg.channel.send({ content: `${msg.author} bu komutu kullanmak için \`Administrator\` yetkisine sahip olmalısın.`})
        const kayıt_embed = new EmbedBuilder()
        .setAuthor({ name: `${msg.guild.name} Kayıt Sistemi`, iconURL: msg.guild.iconURL()})
        .setColor("Random")
        .setFooter({ text: `${config.Footer}`})
        .setThumbnail(msg.guild.iconURL())
        .setDescription(`${msg.guild.name} Sunucusuna hoşgeldiniz sunucumuza kayıt olmak için lütfen aşağıdaki butona tıklayınız.`)

        const kayıtbuton = new ButtonBuilder()
        .setCustomId("kayitbuton")
        .setLabel("Kayıt Ol")
        .setStyle(3)
        .setEmoji("✅")

        const kayıtsızbuton = new ButtonBuilder()
        .setCustomId("kayitsizbuton")
        .setLabel("Kayıtsıza Gir")
        .setStyle(4)


        const row = new ActionRowBuilder()
        .addComponents(kayıtbuton,kayıtsızbuton)

        msg.channel.send({ embeds: [kayıt_embed], components: [row]})
    } 

    if (command === "!rolmenü") {
        if (!msg.member.permissions.has("Administrator")) return msg.channel.send({ content: `${msg.author} bu komutu kullanmak için \`Administrator\` yetkisine sahip olmalısın.`})
        const rol_embed = new EmbedBuilder()
            .setAuthor({ name: `${msg.guild.name} Rol Menüsü`})
            .setColor("Random")
            .setFooter({ text: `${config.Footer}`})
            .setThumbnail(msg.guild.iconURL())
            .setDescription(`Sunucumuzda bildirimlerden diğer üyelerden daha önce haberdar olmak istiyorsan aşağıdaki menüden <@&${config.etkinlikKatılımcısı}> & <@&${config.cekilisKatılımcısı}> rolünü üzerine ekleyebilirsin`)
        
        const roles = new SelectMenuBuilder()
        .setCustomId("ecrol")
        .setPlaceholder(`Etkinlik/Çekiliş Katılımcısı Rol Menüsü`)
        .setMinValues(1)
        .setMaxValues(2)
        .addOptions(
            {
                label: "Etkinlik Katılımcısı",
                value: "e_katilimcisi",
                description: "@Etkinlik Katılımcısı rolünü üzerinize alırsınız"
            }, 
            {
                label: "Çekiliş Katılımcısı",
                value: "c_katilimcisi",
                description: "@Çekiliş Katılımcısı rolünü üzerinize alırsınız"
            },
            {
                label: "Rol İstemiyorum",
                value: "rol_cikar",
                description: "E/C rolleriniz üzerinizden alır"
            }
        )
        const row2 = new ActionRowBuilder()
        .addComponents(roles)

        msg.channel.send({ embeds: [rol_embed], components: [row2]})

    }

    if (command === "!başvuru") {
        if (!msg.member.permissions.has("Administrator")) return msg.channel.send({ content: `${msg.author} bu komutu kullanmak için \`Administrator\` yetkisine sahip olmalısın.`})
        const basvuru_embed = new EmbedBuilder()
        .setAuthor({ name: `${msg.guild.name} Başvuru Sistemi`})
        .setColor("Random")
        .setFooter({ text: `${config.Footer}`})
        .setThumbnail(msg.guild.iconURL())
        .setDescription("Sunucumuzda yetkili olmak istiyorsanız yapmanız gereken aşağıdaki butona tıklayıp formu düzgün bir şekilde doldurmak")

        const basvuru_buton = new ButtonBuilder()
        .setCustomId("basvuru_buton")
        .setLabel("Başvuru Yap")
        .setStyle(3)

        const row3 = new ActionRowBuilder()
        .addComponents(basvuru_buton)
        
        msg.channel.send({ embeds: [basvuru_embed], components: [row3]})
    }
})

client.on("interactionCreate", async (i) => {
    if (i.customId === "kayitbuton") {
       await i.member.roles.add(config.uyerol)
       await i.client.channels.cache.get(config.kayıtlog).send({ content: `${i.member} sunucuya kayıt oldu`})
       await i.client.channels.cache.get(config.sohbetKanalı).send({ content: `${i.member} sunucumuza hoşgeldin umarım sunucudan memnun kalırsın`}).then(msg => { setTimeout(() => msg.delete(), 10000)})
       i.reply({ content: "Başarıyla kayıt oldunuz iyi eğlenceler", ephemeral: true })
    }

    if (i.customId === "kayitsizbuton") {
        await i.member.roles.remove(config.uyerol)
        await i.client.channels.cache.get(config.kayıtlog).send({ content: `${i.member} kendini kayıtsıza attı`})
        i.reply({ content: "Başarıyla kayıtsıza atıldınız.", ephemeral: true })
    }

    if (i.isSelectMenu()) {
        let choice = i.values[0]
        if (choice === "c_katilimcisi") {
            if (!i.member.roles.cache.has(config.cekilisKatılımcısı)) {
                i.reply({ content: "Çekiliş Katılımcısı rolü üzerinize eklendi", ephemeral: true})
                i.member.roles.add(config.cekilisKatılımcısı)
            } else {
                if (i.member.roles.cache.has(config.cekilisKatılımcısı)) {
                    i.reply({ content: "Rol zaten üzerinizde var, eğer rolü üzerinizden almak istiyorsanız menüden Rol İstemiyorum seçeneğine tıklayınız.", ephemeral: true})
                }
            }
        }
        if (choice === "e_katilimcisi") {
            if (!i.member.roles.cache.has(config.etkinlikKatılımcısı)) {
                i.reply({ content: "Etkinlik Katılımcısı rolü üzerinize eklendi", ephemeral: true})
                i.member.roles.add(config.etkinlikKatılımcısı)
            } else {
                if (i.member.roles.cache.has(config.etkinlikKatılımcısı)) {
                    i.reply({ content: "Rol zaten üzerinizde var, eğer rolü üzerinizden almak istiyorsanız menüden Rol İstemiyorum seçeneğine tıklayınız", ephemeral: true})
                }
            }
        }
        if (choice === "rol_cikar") {
            if (i.member.roles.cache.has(config.cekilisKatılımcısı) || i.member.roles.cache.has(config.etkinlikKatılımcısı)) {
                i.reply({ content: "Rol üzerinizden alındı", ephemeral: true})
                i.member.roles.remove(config.cekilisKatılımcısı)
                i.member.roles.remove(config.etkinlikKatılımcısı)
            } else {
                if (!i.member.roles.cache.has(config.cekilisKatılımcısı) || !i.member.roles.cache.has(config.etkinlikKatılımcısı)) {
                    i.reply({ content: "Rol zaten üzerinizde yok :face_with_raised_eyebrow:", ephemeral: true})
                }
            }
        } 
    }

    const modal = new ModalBuilder()
    .setCustomId('ybasvuru')
    .setTitle('Yetkili Başvuru')
    .setComponents(
      new ActionRowBuilder()
        .setComponents(
          new TextInputBuilder()
          .setCustomId("isimyas")
          .setLabel("İsminiz ve Yaşınız")
          .setStyle(1)
          .setMinLength(5)
          .setMaxLength(20)
          .setPlaceholder('İsminizi ve yaşınızı yazınız. / Örnek: Titan 18')
          .setRequired(true),
        ),
      new ActionRowBuilder()
        .setComponents(
          new TextInputBuilder()
          .setCustomId("aktiflik")
          .setLabel("Sunucuda ne kadar aktifsiniz?")
          .setStyle(1)
          .setMinLength(1)
          .setMaxLength(10)
          .setPlaceholder("Sunucudaki günlük aktifliğiniz. / Örnek: 13 saat")
          .setRequired(true)
        ),
      new ActionRowBuilder()
        .setComponents(
          new TextInputBuilder()
          .setCustomId("ability")
          .setLabel("Sunucumuz için neler yapabilirsiniz?")
          .setStyle(1)
          .setMinLength(5)
          .setMaxLength(100)
          .setPlaceholder('Lütfen buraya yazın. / Örnek: Çekiliş yapmak veya diğer...')
          .setRequired(true)
        ),
      new ActionRowBuilder()
        .setComponents(
            new TextInputBuilder()
            .setCustomId("oneri")
            .setLabel("Sunucumuz için öneri/şikayetleriniz?")
            .setStyle(1)
            .setMinLength(5)
            .setMaxLength(100)
            .setPlaceholder("Buraya yazınız. / Örnek: Küfür yasaklansın")
            .setRequired(true)
        )
    )
    if (i.customId === "basvuru_buton") {
        i.showModal(modal)
    }
    let message ;
    let logKanalı = client.guilds.cache.get(config.guildID).channels.cache.find((channel) => channel.name === "başvuru-log")

    if (i.customId === "ybasvuru") {

        const kabulet = new ButtonBuilder()
        .setCustomId("basvuru_kabul")
        .setLabel("Kabul Et")
        .setStyle(3)
        .setEmoji("✅")

        const reddet = new ButtonBuilder()
        .setCustomId("basvuru_red")
        .setLabel("Reddet")
        .setStyle(1)
        .setEmoji("❌")

        const row4 = new ActionRowBuilder()
        .addComponents(kabulet,reddet)

        
        const isimyas = i.fields.getTextInputValue("isimyas");
        const aktiflik = i.fields.getTextInputValue("aktiflik");
        const ability = i.fields.getTextInputValue("ability");
        const oneri = i.fields.getTextInputValue("oneri")

        const titan = new EmbedBuilder()
        .setColor("Random")
        .setAuthor({ name: `${i.guild.name} Başvuru Sistemi`})
        .setThumbnail(i.guild.iconURL())
        .setDescription(`
        **${i.user.tag}** - (\`${i.user.id}\`) ** Kullanıcısının Başvuru Formu**
        
        ** İsminiz ve Yaşınız**
        \`${isimyas}\`
        
        **Sunucumuzda Günlük Aktifliğiniz**
        \`${aktiflik}\`

        **Sunucumuz için neler yapabilirsiniz**
        \`${ability}\`

        **Sunucumuz için önerileriniz/şikayetleriniz**
        \`${oneri}\`
        `)
        .setTimestamp()

        await i.reply({ content: `Başvurunuz başarıyla alındı, şimdi tek yapmanız gereken yetkililerin cevap vermesini beklemek :) umarım kabul edilir..`, ephemeral: true})
        message = await logKanalı.send({ content: `${i.user}`, embeds: [titan], components: [row4]})
        db.set(message.id,i.user.id)
    }

    const basvuruDurum = i.guild.channels.cache.find((channel) => channel.name === "başvuru-durum")

    if (i.customId === "basvuru_kabul") {

        if (!i.member.roles.cache.has(config.basvuruYt)) return i.reply({ content: `Başvuruyu yanıtlamak için <@&${config.basvuruYt}> rolüne sahip olmalısın`, ephemeral: true})

        const kabulet2 = new ButtonBuilder()
        .setCustomId("basvuru_kabul")
        .setLabel("Kabul Edildi")
        .setStyle(3)
        .setEmoji("✅")
        .setDisabled(true)


        const row5 = new ActionRowBuilder()
        .addComponents(kabulet2)

        i.update({ components: [row5]})
        let kişi = db.get(i.message.id)
        let kullanıcı = i.client.guilds.cache.get(config.guildID).members.cache.get(kişi) 
        kullanıcı.roles.add(config.yetkiRolleri)
        await basvuruDurum.send({ content: `<@${kişi}>, Tebrikler! Başvurunuz **kabul edildi** ve **yetkili ekibimize** onaylandınız. \n **Sizi onaylayan kişi: **${i.user.toString()}`})
        kullanıcı.user.send(`Yetkili Başvurun Başarıyla **Onaylanmıştır**`).catch(() => {});
        db.delete(i.message.id)
    } 
    if (i.customId === "basvuru_red") {

        let kişi = db.get(i.message.id)
        let kullanıcı = i.client.guilds.cache.get(config.guildID).members.cache.get(kişi)

        const reddet2 = new ButtonBuilder()
        .setCustomId("başvuru_red")
        .setLabel("Reddedildi")
        .setStyle(1)
        .setEmoji("❌")
        .setDisabled(true)

        const row6 = new ActionRowBuilder()
        .addComponents(reddet2)
        await basvuruDurum.send({ content: `<@${kişi}>, Maalesef ! Başvurunuz **kabul edilmedi** ve **yetkili ekibimize** onaylanmadınız. \n **Sizi onaylamayan kişi: **${i.user.toString()}`})
        i.update({ components: [row6]})
        kullanıcı.user.send(`Maalef yetkili başvurun reddedilmiştir!`).catch(() => {});
        db.delete(i.message.id)
    }
})



client
.login(config.token)
.then(() => console.log("Bot başarıyla bağlandı"))
.catch(() => console.log("Bot bağlanamadı"));






//  Log Kısmı

