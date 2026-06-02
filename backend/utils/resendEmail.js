export async function sendContactEmail(contactData, userId) {
    const { fio, phone, desiredDate, message, photoBase64, userEmail } = contactData;

    const htmlContent = `
        <h2>Новое сообщение из формы обратной связи</h2>
        <p><strong>От пользователя (ID):</strong> ${userId}</p>
        <p><strong>Email отправителя:</strong> ${userEmail || 'не указан'}</p>
        <p><strong>ФИО:</strong> ${fio}</p>
        <p><strong>Телефон:</strong> ${phone}</p>
        <p><strong>Желаемая дата связи:</strong> ${desiredDate}</p>
        <p><strong>Сообщение:</strong> ${message || '—'}</p>
        ${photoBase64 && photoBase64.startsWith('data:image/') ? '<p><strong>Фото:</strong> (приложено отдельным файлом)</p>' : ''}
    `;

    const emailData = {
        from: process.env.RESEND_FROM_EMAIL,
        to: process.env.ADMIN_EMAIL,
        subject: `Новое сообщение от ${fio}`,
        html: htmlContent,
    };

    if (photoBase64 && photoBase64.startsWith('data:image/')) {

        const matches = photoBase64.match(/^data:image\/(\w+);base64,(.+)$/);
        if (matches) {
            const imageType = matches[1];
            const base64Data = matches[2];
            const filename = `photo-${Date.now()}.${imageType}`;
            
            emailData.attachments = [
                {
                    filename: filename,
                    content: base64Data,
                    encoding: 'base64',
                },
            ];
        }
    }

    const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
    });

    if (!res.ok) {
        const error = await res.text();
        throw new Error(`Resend API error: ${res.status} ${error}`);
    }

    const data = await res.json();
    console.log(`[email] Письмо отправлено, ID: ${data.id}`);
}