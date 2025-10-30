from googletrans import Translator, LANGUAGES
import asyncio

def translate_text(text, target_language, source_language=None):
    """
    Traduce un texto usando la librería googletrans.

    Args:
        text (str): El texto a traducir.
        target_language (str): El idioma de destino (ej: 'en').
        source_language (str, optional): El idioma de origen (ej: 'es'). 
                                         Si es None, se detectará automáticamente.

    Returns:
        dict: Un diccionario con 'translated_text' y 'detected_source_language',
              o un diccionario con 'error'.
    """
    # Validar que el idioma de destino sea válido
    if target_language not in LANGUAGES:
        return {'error': f"El idioma de destino '{target_language}' no es válido."}

    # --- INICIO DE LA CORRECCIÓN ---
    # googletrans 4.0.0-rc1 es asíncrono. Necesitamos ejecutar la corutina.
    async def do_translation():
        translator = Translator()
        # Si se especifica el idioma de origen, lo usamos. Si no, se detecta.
        if source_language and source_language in LANGUAGES:
            return await translator.translate(text, dest=target_language, src=source_language)
        else:
            return await translator.translate(text, dest=target_language)

    try:
        # Ejecutamos la función asíncrona desde nuestro contexto síncrono
        translation = asyncio.run(do_translation())
        return {
            'translated_text': translation.text,
            'detected_source_language': translation.src
        }
    # --- FIN DE LA CORRECCIÓN ---
    except Exception as e:
        return {'error': f"Ocurrió un error durante la traducción: {str(e)}"}