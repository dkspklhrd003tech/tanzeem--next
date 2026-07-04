import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, GripVertical, Trash2, Save } from 'lucide-react';

interface Section {
  id: string;
  type: string;
  order: number;
  config: Record<string, any>;
}

export function PageBuilder({ pageId }: { pageId: string }) {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch sections for the page
    // In a real implementation, this would fetch from /api/pages/[slug]/sections
  }, [pageId]);

  const addSection = (type: string) => {
    const newSection: Section = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      order: sections.length,
      config: {}
    };
    setSections([...sections, newSection]);
  };

  const removeSection = (id: string) => {
    setSections(sections.filter(s => s.id !== id));
  };

  const saveSections = async () => {
    setLoading(true);
    // In a real implementation, this would POST to /api/admin/pages/[pageId]/sections
    setTimeout(() => {
      setLoading(false);
      alert('Sections Saved Successfully!');
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Page Sections</h3>
        <Button onClick={saveSections} disabled={loading}>
          <Save className="h-4 w-4 mr-2" /> {loading ? 'Saving...' : 'Save Sections'}
        </Button>
      </div>

      <div className="space-y-4">
        {sections.map((section, index) => (
          <div key={section.id} className="border border-border p-4 rounded-lg flex items-start gap-4 bg-white ">
            <div className="cursor-grab text-gray-400 mt-2">
              <GripVertical className="h-5 w-5" />
            </div>
            <div className="flex-1 space-y-4">
              <div className="flex justify-between">
                <span className="font-semibold uppercase text-sm text-primary">{section.type}</span>
                <Button variant="ghost" size="sm" onClick={() => removeSection(section.id)} className="text-red-500 hover:text-red-700">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-sm text-gray-500">
                Configuration for {section.type} goes here.
              </div>
            </div>
          </div>
        ))}

        {sections.length === 0 && (
          <div className="text-center py-8 text-gray-500 border border-dashed rounded-lg">
            No sections added yet. Add a section to build your page.
          </div>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={() => addSection('hero')}>
          <Plus className="h-4 w-4 mr-1" /> Add Hero
        </Button>
        <Button variant="outline" size="sm" onClick={() => addSection('founder')}>
          <Plus className="h-4 w-4 mr-1" /> Add Founder
        </Button>
        <Button variant="outline" size="sm" onClick={() => addSection('spotlight')}>
          <Plus className="h-4 w-4 mr-1" /> Add Spotlight
        </Button>
        <Button variant="outline" size="sm" onClick={() => addSection('text')}>
          <Plus className="h-4 w-4 mr-1" /> Add Text Block
        </Button>
      </div>
    </div>
  );
}
