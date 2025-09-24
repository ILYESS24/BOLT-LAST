import { Link } from '@tanstack/react-router';
import { Home, MessageSquare, Settings, Plus } from 'lucide-react';

const navigation = [
  { name: 'Accueil', href: '/', icon: Home },
  { name: 'Chat', href: '/chat', icon: MessageSquare },
  { name: 'Paramètres', href: '/settings', icon: Settings },
];

export function Sidebar() {
  return (
    <div className="w-64 bg-card border-r border-border">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary">Dyad Web</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Constructeur d'applications IA
        </p>
      </div>
      
      <nav className="px-4 pb-4">
        <ul className="space-y-2">
          {navigation.map((item) => (
            <li key={item.name}>
              <Link
                to={item.href}
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
        
        <div className="mt-6 pt-6 border-t border-border">
          <button className="flex items-center w-full px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors">
            <Plus className="mr-3 h-5 w-5" />
            Nouvelle application
          </button>
        </div>
      </nav>
    </div>
  );
}
