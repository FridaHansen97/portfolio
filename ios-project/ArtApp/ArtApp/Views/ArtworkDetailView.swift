import SwiftUI
import SwiftData

struct ArtworkDetailView: View {
    let artwork: Artwork
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                ArtworkImage(url: artwork.imageURL)
                    .frame(maxWidth: .infinity, minHeight: 300, maxHeight: 500)
                    .accessibilityLabel(artwork.title ?? "Artwork")
                
                VStack(alignment: .leading, spacing: 4) {
                    Text(artwork.title ?? "Untitled")
                        .font(.title2)
                        .fontWeight(.bold)
                    
                    Text(artwork.creators?.first?.description ?? "Unknown artist")
                        .foregroundStyle(.secondary)
                    
                    if let date = artwork.creationDate {
                        Text(date)
                            .foregroundStyle(.secondary)
                    }
                }
                
                if let technique = artwork.technique {
                    Text(technique)
                        .font(.subheadline)
                        .italic()
                }
                
                if let description = artwork.description {
                    Text(description)
                }
            }
            .padding()
        }
        .navigationTitle(artwork.title ?? "Artwork")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            FavoriteButton(artwork: artwork)
        }
    }
}
#Preview {
    NavigationStack {
        ArtworkDetailView(artwork: .sample)
    }
    .modelContainer(for: FavoriteArtwork.self, inMemory: true)
}
