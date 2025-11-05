import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useResume } from '../contexts/ResumeContext';
import { useAuth } from '../contexts/AuthContext';
import { sharingService } from '../services/sharingService';
import {
  Share2,
  Download,
  Eye,
  EyeOff,
  Copy,
  Calendar,
  Link2,
  Shield,
  Globe,
  Smartphone,
  Award
} from 'lucide-react';

interface ResumeSharingProps {
  resumeId?: string;
}

interface ShareLink {
  shareId: string;
  shareUrl: string;
  qrCode: string;
  isPublic: boolean;
  isPasswordProtected: boolean;
  expiresAt: string;
  totalViews: number;
  totalDownloads: number;
  created: string;
  lastAccessed: string | null;
  owner: {
    id: string;
    name: string;
    subscriptionTier: string;
  };
  resume: {
    id: string;
    title: string;
  };
}

const ResumeSharing: React.FC<ResumeSharingProps> = ({ resumeId }) => {
  const { user } = useAuth();
  const { currentContent } = useResume();
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateShareModal, setShowCreateModal] = useState(false);
  const [selectedShare, setSelectedShare] = useState<ShareLink | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const [shareForm, setShareForm] = useState({
    isPublic: false,
    expiresInDays: 30,
    passwordProtected: false,
    password: '',
    passwordConfirm: ''
  });

  useEffect(() => {
    if (resumeId) {
      loadShareLinks();
    }
  }, [resumeId]);

  const loadShareLinks = async () => {
    try {
      setLoading(true);
      const links = await sharingService.getUserShares();
      setShareLinks(links);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load share links:', err);
      setError(err.response?.data?.error || 'Failed to load share links');
    } finally {
      setLoading(false);
    }
  };

  const createShare = async () => {
    if (!resumeId) {
      setError('No resume selected for sharing');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let shareLink: ShareLink;

      if (shareForm.isPublic) {
        const result = await sharingService.createPublicShare(resumeId);
        shareLink = result;
      } else {
        const options: any = {};
        if (shareForm.expiresInDays) {
          options.expiresInDays = shareForm.expiresInDays;
        }
        if (shareForm.passwordProtected) {
          options.passwordProtected = true;
        }
        if (shareForm.password && shareForm.password === shareForm.passwordConfirm) {
          options.password = shareForm.password;
        }
        const result = await sharingService.createPrivateShare(resumeId, options);
        shareLink = result;
      }

      setShareLinks(prev => [shareLink, ...prev.slice(0, 4)]); // Keep only 5 most recent
      setShowCreateModal(false);
      setShareForm({
        isPublic: false,
        expiresInDays: 30,
        passwordProtected: false,
        password: '',
        passwordConfirm: ''
      });

      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err: any) {
      console.error('Failed to create share link:', err);
      setError(err.response?.data?.error || 'Failed to create share link');
    } finally {
      setLoading(false);
    }
  };

  const deleteShare = async (shareId: string) => {
    try {
      await sharingService.deleteShareLink(shareId);
      setShareLinks(prev => prev.filter(link => link.id !== shareId));
    } catch (err: any) {
      console.error('Failed to delete share link:', err);
      setError(err.response?.data?.error || 'Failed to delete share link');
    }
  };

  const updateShare = async (shareId: string, updates: any) => {
    try {
      const updatedShare = await sharingService.updateShareLink(shareId, updates);
      setShareLinks(prev =>
        prev.map(link =>
          link.id === shareId ? updatedShare : link
        )
      );
    } catch (err: any) {
      console.error('Failed to update share link:', err);
      setError(err.response?.data?.error || 'Failed to update share link');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const downloadResume = async (shareId: string) => {
    try {
      window.open(`/shared/${shareId}`, '_blank');
    } catch (error) {
      console.error('Failed to open download URL:', error);
    }
  };

  const formatExpiration = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
  };

  const isExpired = (dateString: string): boolean => {
    return new Date(dateString) < new Date();
  };

  const getExpirationColor = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 1) return 'text-green-600';
    if (diffDays < 7) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Share Your Resume</h3>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center"
        >
          <Share2 className="h-4 w-4 mr-2" />
          Create Share Link
        </button>
      </div>

      {/* Create Share Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 w-full max-h-screen overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Share Link</h3>

            <div className="space-y-4">
              {/* Share Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Share Type
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="shareType"
                      value="public"
                      checked={shareForm.isPublic}
                      onChange={(e) => setShareForm({
                        ...shareForm,
                        isPublic: e.target.value === 'public',
                        passwordProtected: false,
                        password: '',
                        passwordConfirm: ''
                      })}
                      className="h-4 w-4 text-primary-600"
                    />
                    <span className="ml-2 text-sm font-medium">Public (no password required)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="shareType"
                      value="private"
                      checked={!shareForm.isPublic}
                      onChange={(e) => setShareForm({
                        ...shareForm,
                        isPublic: e.target.value === 'public',
                        passwordProtected: e.target.value === 'private',
                        password: '',
                        passwordConfirm: ''
                      })}
                      className="h-4 w-4 text-primary-600"
                    />
                    <span className="ml-2 text-sm font-medium">Private (optional)</span>
                  </label>
                </div>

              {/* Expiration Settings */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link Expires In
                </label>
                <select
                  value={shareForm.expiresInDays}
                  onChange={(e) => setShareForm({
                    ...shareForm,
                    expiresInDays: parseInt(e.target.value)
                  })}
                  className="input w-full"
                >
                  <option value={7}>7 days</option>
                  <option value={30}>30 days (default)</option>
                  <option value={90}>90 days</option>
                  <option value={365}>1 year</option>
                </select>
              </div>

              {/* Password Protection (Private Only) */}
              {!shareForm.isPublic && (
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="passwordProtected"
                      checked={shareForm.passwordProtected}
                      onChange={(e) => setShareForm({
                        ...shareForm,
                        passwordProtected: e.target.checked,
                        password: '',
                        passwordConfirm: ''
                      })}
                      className="h-4 w-4 text-primary-600"
                    />
                    <span className="text-sm font-medium">Password protected</span>
                  </label>
                </div>

                {shareForm.passwordProtected && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                      </label>
                      <input
                        type="password"
                        value={shareForm.password}
                        onChange={(e) => setShareForm({
                          ...shareForm,
                          password: e.target.value,
                          passwordConfirm: ''
                        })}
                        className="input"
                        placeholder="Enter password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        value={shareForm.passwordConfirm}
                        onChange={(e) => setShareForm({
                          ...shareForm,
                          passwordConfirm: e.target.value,
                          password: shareForm.password
                        })}
                        className="input"
                        placeholder="Confirm password"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={createShare}
                disabled={
                  !shareForm.isPublic &&
                  (!shareForm.passwordProtected || (shareForm.password && shareForm.password === shareForm.passwordConfirm))
                }
                className="btn-primary w-full"
              >
                Create Share Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Existing Share Links */}
      {shareLinks.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Your Share Links</h3>
          <div className="space-y-3">
            {shareLinks.map((shareLink) => (
              <div
                key={shareLink.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {shareLink.resume.title}
                    </h4>
                    <p className="text-sm text-gray-500">
                      Shared {formatExpiration(shareLink.expiresAt)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getExpirationColor(shareLink.expiresAt)}`}
                    >
                      {getExpirationColor(shareLink.expiresAt)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {shareLink.isPublic ? 'Public' : 'Private'}
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-4">
                    <Eye className="h-4 w-4 text-gray-400" />
                    <span>{shareLink.totalViews}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Download className="h-4 w-4 text-gray-400" />
                    <span>{shareLink.totalDownloads}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 pt-4">
                  <button
                    onClick={() => copyToClipboard(shareLink.shareUrl)}
                    className="btn-outline text-sm"
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy Link
                  </button>

                  <button
                    onClick={() => downloadResume(shareLink.id)}
                    className="btn-outline text-sm"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </button>

                  {!shareLink.isPublic && (
                    <button
                      onClick={() => updateShare(shareLink.id, { isPublic: true })}
                      className="btn-secondary text-sm"
                    >
                      Make Public
                    </button>
                  )}

                  <button
                    onClick={() => deleteShare(shareLink.id)}
                    className="btn-outline text-sm text-red-600 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected Share Details */}
      {selectedShare && (
        <div className="mt-6 p-6 bg-gray-50 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Share Details</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Share URL:</span>
              <a
                href={selectedShare.shareUrl}
                target="_blank"
                className="text-blue-600 hover:text-blue-800 text-sm truncate"
              >
                {selectedShare.shareUrl}
              </a>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Created:</span>
              <span className="text-sm text-gray-900">
                {formatExpiration(selectedShare.created)}
              </span>
            </div>

            {selectedShare.isPasswordProtected && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Access:</span>
                <span className="text-sm text-green-600">Password Protected</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Views:</span>
              <span className="text-sm text-gray-900">{selectedShare.totalViews}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Downloads:</span>
              <span className="text-sm text-gray-900">{selectedShare.totalDownloads}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Owner:</span>
              <span className="text-sm text-gray-900">
                {selectedShare.owner.name} ({selectedShare.owner.subscriptionTier})
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Resume:</span>
              <span className="text-sm text-gray-900">
                <a
                  href={`/editor/${selectedShare.resume.id}`}
                  className="text-blue-600 hover:text-blue-800 text-sm truncate"
                >
                  {selectedShare.resume.title}
                </a>
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-4">
            <button
              onClick={() => copyToClipboard(selectedShare.shareUrl)}
              className="btn-primary"
            >
              <Copy Link
            </button>

            <button
              onClick={() => downloadResume(selectedShare.id)}
              className="btn-secondary"
            >
              <Download Resume
            </button>

            <button
              onClick={() => setSelectedShare(null)}
              className="btn-outline"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeSharing;