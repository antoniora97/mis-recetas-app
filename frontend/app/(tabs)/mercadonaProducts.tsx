import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, SectionList, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function mercadonaProducts() {
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState(null); // Para avisar si el backend está cargando

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://127.0.0.1:3000/api/products/mercadona');
            const result = await response.json();

            // console.log("RESULTADOS " + result.data);

            if (result.data && Array.isArray(result.data)) {
                // TRANSFORMAR LOS DATOS AQUÍ
                const formattedSections = result.data.map(section => ({
                    ...section,
                    // SectionList necesita que el array de items se llame "data"
                    data: section.categories || []
                })).filter(section => section.data.length > 0);

                setSections(formattedSections);
                setErrorMsg(null);
            }

        } catch (error) {
            console.error("Error de conexión:", error);
            setErrorMsg("No se pudo conectar con el servidor local.");
        } finally {
            setLoading(false);
        }
    };

    // Pantalla de carga
    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#00843D" />
                <Text style={{ marginTop: 10 }}>Conectando con el catálogo...</Text>
            </View>
        );
    }

    // Pantalla de error o mensaje de "Scraping en curso"
    if (errorMsg) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>{errorMsg}</Text>
                <Text style={{ color: 'blue', marginTop: 20 }} onPress={fetchProducts}>Reintentar</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <SectionList
                sections={sections}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                renderItem={({ item }) => (
                    <View style={styles.productCard}>
                        {/* Verifica si 'item.image' es una URL completa */}
                        <Image source={{ uri: item.thumbnail || item.image }} style={styles.image} />
                        <View style={styles.info}>
                            <Text style={styles.productName}>{item.name || item.title}</Text>
                            {/* Si 'unitPrice' no existe en el JSON, el precio saldrá vacío */}
                            <Text style={styles.price}>{item.price || item.unitPrice} €</Text>
                        </View>
                    </View>
                )}
                renderSectionHeader={({ section: { name } }) => (
                    <Text style={styles.sectionHeader}>{name}</Text>
                )}
                stickySectionHeadersEnabled={true} // Hace que los títulos se queden pegados arriba al hacer scroll
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    errorText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#666'
    },
    sectionHeader: {
        fontWeight: '800',
        fontSize: 14,
        color: '#666',
        backgroundColor: '#f0f0f0',
        textTransform: 'uppercase',
        padding: 20
    },
    productCard: {
        flexDirection: 'row',
        padding: 15,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        alignItems: 'center',
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 15,
    },
    info: {
        flex: 1,
    },
    productName: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4,
    },
    price: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#00843D', // Color verde Mercadona
    },
    unit: {
        fontSize: 12,
        color: '#888',
    },
});